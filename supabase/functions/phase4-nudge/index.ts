import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getClientIdentifier } from "../_shared/rateLimit.ts";

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin, { "Access-Control-Allow-Methods": "POST, OPTIONS" });

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const t0 = Date.now();

  try {
    const clientId = getClientIdentifier(req);
    const rateLimit = await checkRateLimit(clientId, {
      maxRequests: 10,
      windowMs: 60000,
    });

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please slow down." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let { token, guesses, hints } = await req.json();

    if (!token || !guesses || !hints) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: token, guesses, hints" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decode token to get target and type
    try {
      token = decodeURIComponent(token);
    } catch {
      // If decoding fails, use original token
    }

    const secret = Deno.env.get("CHALLENGE_SIGNING_SECRET");
    if (!secret) {
      throw new Error("JWT signing secret not configured");
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      return new Response(
        JSON.stringify({ error: "Invalid token format" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureData = encoder.encode(`${encodedHeader}.${encodedPayload}`);

    let signature: Uint8Array;
    try {
      const sigBase64 = encodedSignature.replace(/-/g, "+").replace(/_/g, "/");
      const sigPadded = sigBase64.padEnd(sigBase64.length + (4 - sigBase64.length % 4) % 4, "=");
      signature = Uint8Array.from(atob(sigPadded), (c) => c.charCodeAt(0));
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to decode signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isValid = await crypto.subtle.verify("HMAC", key, signature, signatureData);

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid token signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let payload: any;
    try {
      const payloadBase64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
      const payloadPadded = payloadBase64.padEnd(payloadBase64.length + (4 - payloadBase64.length % 4) % 4, "=");
      const payloadJson = atob(payloadPadded);
      payload = JSON.parse(payloadJson);
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to decode token payload" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return new Response(
        JSON.stringify({ error: "Token expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const target = payload.target;
    const type = payload.type || "unknown";

    const t1 = Date.now();

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hintsSummary = `
Phase 1 (5 words): ${JSON.stringify(hints.phase1)}
Phase 2 (sentence): ${hints.phase2}
Phase 3 (5 categories): ${JSON.stringify(hints.phase3)}
`;

    const guessesSummary = guesses.map((g: string, i: number) => `${i + 1}. ${g}`).join('\n');

    const prompt = `You are helping a player in a guessing game. The correct answer is "${target}" (a ${type}).

The player has seen these hints:
${hintsSummary}

The player has made these WRONG guesses:
${guessesSummary}

Your task: Analyze WHY the player is guessing wrong and guide them toward the correct answer.

ANALYSIS STEPS:
1. Look at what the wrong guesses have in COMMON - this shows the player's thinking pattern
2. Identify what DISTINGUISHES the correct answer (${target}) from their guesses
3. Find a connection between their guesses and the real answer that could help them pivot

For example:
- If they guessed "Lady Gaga" and "Beyonce" but answer is "Ariana Grande" - they're thinking female pop stars, guide them to think about: vocal range, Disney/Nickelodeon origins, ponytail signature
- If they guessed "Paris" and "London" but answer is "Rome" - they're thinking European capitals, guide them to: ancient history, Vatican, Colosseum

Write a HELPFUL 15-20 word nudge that:
1. Acknowledges their thinking pattern WITHOUT saying "you're close" or "you're on the right track"
2. Gives a SPECIFIC distinguishing detail about ${target} that separates it from their guesses
3. Does NOT reveal the answer directly

Return JSON:
{
  "nudge": "Your 15-20 word personalized hint based on their guesses",
  "keywords": ["3 keywords that distinguish ${target} from their guesses"],
  "pattern_identified": "What the player seems to be thinking"
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 200,
        messages: [
          {
            role: "system",
            content: "You are a helpful game master who gives personalized hints based on player behavior. Analyze their wrong guesses to understand their thinking, then guide them toward the answer without revealing it."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI failed: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    const t2 = Date.now();
    console.log(`[PERF] phase4-nudge | jwt:${t1-t0}ms openai:${t2-t1}ms total:${t2-t0}ms`);

    return new Response(
      JSON.stringify({
        nudge: result.nudge,
        keywords: result.keywords || [],
        pattern_identified: result.pattern_identified || null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred generating the nudge" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});