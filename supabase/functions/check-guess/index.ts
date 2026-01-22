import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function normalizeGuess(text: string): string {
  let normalized = text.toLowerCase().trim();
  normalized = normalized.replace(/\s+/g, " ");
  normalized = normalized.replace(/^(the|a|an)\s+/i, "");
  normalized = normalized.replace(/[^a-z0-9\s]/g, "");
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return normalized;
}

Deno.serve(async (req: Request) => {

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const t0 = Date.now();

  try {
    let { token, guess, phase, player_fingerprint } = await req.json();

    if (!token || !guess) {
      return new Response(
        JSON.stringify({ error: "Token and guess are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decode URL-encoded token if necessary
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
    } catch (e) {
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
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Failed to decode base64" }),
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

    const t1 = Date.now();

    if (guess === "__reveal__") {
      return new Response(
        JSON.stringify({ canonical: payload.target }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

      const normalizedGuess = normalizeGuess(guess);
      const normalizedTarget = normalizeGuess(payload.target);
      const normalizedAliases = (payload.aliases || []).map(normalizeGuess);

      let isCorrect =
        normalizedGuess === normalizedTarget ||
        normalizedAliases.includes(normalizedGuess);

      if (!isCorrect) {
        const guessWords = normalizedGuess.split(" ").filter(Boolean);
        if (guessWords.length > 1) {
          const comparisonSets = [normalizedTarget, ...normalizedAliases]
            .map((value) => value.split(" ").filter(Boolean));

          const meaningfulGuessWords = guessWords.filter((word) => word.length > 3);
          if (meaningfulGuessWords.length) {
            isCorrect = comparisonSets.some((words) => {
              if (!words.length) return false;
              const meaningfulTargetWords = words.filter((word) => word.length > 3);
              if (!meaningfulTargetWords.length) return false;

              // Calculate bidirectional coverage
              const matchingWords = meaningfulGuessWords.filter((word) => meaningfulTargetWords.includes(word)).length;
              const guessCoverage = matchingWords / meaningfulGuessWords.length;
              const targetCoverage = matchingWords / meaningfulTargetWords.length;

              // Require BOTH high coverage: guess must contain 80%+ of target words AND target must contain 80%+ of guess words
              return guessCoverage >= 0.8 && targetCoverage >= 0.8;
            });
          }
        }
      }

    const t2 = Date.now();

    let suggestion = null;
    let similarityScore = 0;

    if (!isCorrect && guess.length >= 3) {
      const openaiKey = Deno.env.get("OPENAI_API_KEY");
      if (openaiKey) {
        try {
          const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openaiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              temperature: 0.2,
              messages: [{
                role: "system",
                content: "You are a semantic similarity expert. Rate how close guesses are to targets with precise scores. Be specific and accurate - avoid defaulting to 50%."
              }, {
                role: "user",
                content: `The player guessed "${guess}" but the correct answer is "${payload.target}".

Rate the semantic similarity on this SPECIFIC scale:
- 0-15: Completely unrelated (different domain entirely)
- 16-30: Same broad category only (both are musicians, both are cities, etc.)
- 31-45: Same subcategory with weak connection (same genre, same era, same region)
- 46-60: Moderate connection (collaborated together, similar style, same movement)
- 61-75: Strong connection (same group/team, direct relationship, very similar)
- 76-90: Very close (alternative name, close associate, almost correct)
- 91-95: Near-identical (typo, nickname, partial name)

Think about the SPECIFIC relationship between "${guess}" and "${payload.target}".

If "${guess}" appears to be a typo/misspelling of "${payload.target}" (1-2 character difference), provide the correction in "suggestion". Otherwise null.

Return ONLY this JSON:
{"suggestion": null, "similarity_score": <number 0-95>, "reason": "<brief explanation>"}`
              }],
              max_tokens: 100,
              response_format: { type: "json_object" },
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.choices[0].message.content.trim();
            const parsed = JSON.parse(content);

            // Only accept typo suggestions if they actually match the target answer
            if (parsed.suggestion && parsed.suggestion !== guess) {
              const normalizedSuggestion = normalizeGuess(parsed.suggestion);
              // Verify the suggestion matches the target (real typo correction)
              if (normalizedSuggestion === normalizedTarget || normalizedAliases.includes(normalizedSuggestion)) {
                suggestion = parsed.suggestion;
              }
            }

            if (parsed.similarity_score !== undefined) {
              similarityScore = Math.min(95, parsed.similarity_score);
            }
          }
        } catch (aiError) {
          console.error("AI matching error:", aiError);
        }
      }
    }

    const t3 = Date.now();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fire-and-forget DB write (non-blocking)
    supabase.from("events").insert({
      challenge_id: payload.id,
      kind: "guess",
      meta: {
        guess: normalizedGuess,
        correct: isCorrect,
        phase: phase || 1,
        player_fingerprint,
      },
    }).then(() => {}).catch(e => console.error("Event log failed:", e));

    const t4 = Date.now();
    console.log(`[PERF] check-guess | jwt:${t1-t0}ms match:${t2-t1}ms openai:${t3-t2}ms db:${t4-t3}ms total:${t4-t0}ms`);

    return new Response(
      JSON.stringify({
        result: isCorrect ? "correct" : "incorrect",
        canonical: isCorrect ? payload.target : undefined,
        suggestion: suggestion,
        similarity_score: similarityScore,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});