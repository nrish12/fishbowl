import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  "Access-Control-Max-Age": "86400",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const t0 = Date.now();

  try {
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
${hints.phase4_nudge ? `Phase 4 (nudge): ${hints.phase4_nudge}` : ''}
`;

    const guessesSummary = guesses.map((g: string, i: number) => `${i + 1}. ${g}`).join('\n');

    const bannedWords = target.toLowerCase().split(/\s+/).filter((w: string) => w.length >= 3).join(', ');
    const prompt = `Answer: ${target} (${type})
Hints: ${hintsSummary}
Guesses: ${guessesSummary}

Rate each guess 0-100 based on conceptual similarity, category overlap, and thematic connections.
NEVER use these words: ${bannedWords}

Return JSON:
{
  "semantic_scores": [{"guess": "...", "score": 0-100, "reason": "..."}],
  "connections": [{"guess": "...", "hint": "phase#", "pattern": "..."}],
  "synthesis": "One sentence connecting their attempts",
  "themes_identified": ["theme1", "theme2"],
  "themes_missing": ["theme1", "theme2"]
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
        max_tokens: 350,
        messages: [
          {
            role: "system",
            content: "Analyze guesses. Brief reasons. Never use banned words. Return JSON fast."
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

    const normalizedTarget = target.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");

    const filteredScores = (result.semantic_scores || []).filter((item: any) => {
      const normalizedGuess = (item.guess || "").toLowerCase().trim().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");
      return normalizedGuess !== normalizedTarget;
    }).slice(0, 4);

    // Extract all meaningful words from the target (3+ chars) to filter out
    const targetWords = target.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((word: string) => word.length >= 3);

    // Helper function to sanitize text by removing all target words
    const sanitizeText = (text: string): string => {
      if (!text) return text;
      let sanitized = text;
      targetWords.forEach((word: string) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        sanitized = sanitized.replace(regex, '[...]');
      });
      return sanitized;
    };

    // Double-check: Remove any mention of the target answer from reasons
    const sanitizedScores = filteredScores.map((item: any) => ({
      ...item,
      reason: sanitizeText(item.reason)
    }));

    const t2 = Date.now();
    console.log(`[PERF] phase5-visual | jwt:${t1-t0}ms openai:${t2-t1}ms total:${t2-t0}ms`);

    return new Response(
      JSON.stringify({
        semantic_scores: sanitizedScores,
        connections: result.connections || [],
        synthesis: sanitizeText(result.synthesis) || "Review your guesses and find the pattern.",
        themes_identified: (result.themes_identified && result.themes_identified.length > 0
          ? result.themes_identified.map((theme: string) => sanitizeText(theme))
          : ["Pattern recognition", "Logical deduction"]),
        themes_missing: (result.themes_missing && result.themes_missing.length > 0
          ? result.themes_missing.map((theme: string) => sanitizeText(theme))
          : ["Key details", "Context clues"]),
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