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
    const signature = Uint8Array.from(
      atob(encodedSignature.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const isValid = await crypto.subtle.verify("HMAC", key, signature, signatureData);

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid token signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payloadJson = atob(encodedPayload.padEnd(encodedPayload.length + (4 - encodedPayload.length % 4) % 4, "="));
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return new Response(
        JSON.stringify({ error: "Token expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
              temperature: 0.1,
              messages: [{
                role: "user",
                content: `Analyze the guess "${guess}" in relation to the answer "${payload.target}".

SCORING GUIDELINES (0-100):
- 90-100: Extremely close conceptually, different form/name of same thing
- 75-89: Very closely related, same category/domain with strong connection
- 55-74: Moderately related, shares significant themes or characteristics
- 30-54: Some connection but different domains or weak relationship
- 0-29: Unrelated or completely different concepts

IMPORTANT: Be generous with scores for people/things in the same domain.
Examples: Jimi Hendrix vs Bob Marley (both legendary musicians, same era) = 65-70

TYPO DETECTION:
- Only suggest corrections for clear misspellings (1-3 character differences)
- NEVER suggest "${payload.target}" itself as a correction
- If semantically different, return null for suggestion

Respond ONLY with valid JSON:
{"is_match": "YES" or "NO", "suggestion": "corrected spelling if clear typo, otherwise null", "similarity_score": 0-100}

Examples:
- "hendrix" for "Bob Marley" → {"is_match": "NO", "suggestion": null, "similarity_score": 68}
- "elvis" for "Nick Jonas" → {"is_match": "NO", "suggestion": null, "similarity_score": 35}
- "jonas brothers" for "Nick Jonas" → {"is_match": "NO", "suggestion": null, "similarity_score": 90}
- "backstreet boys" for "Nick Jonas" → {"is_match": "NO", "suggestion": null, "similarity_score": 62}
- "actor" for "Nick Jonas" → {"is_match": "NO", "suggestion": null, "similarity_score": 45}
- "Nick Jonass" for "Nick Jonas" → {"is_match": "NO", "suggestion": "Nick Jonas", "similarity_score": 95}`
              }],
              max_tokens: 100,
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.choices[0].message.content.trim();
            const parsed = JSON.parse(content);

            if (parsed.is_match === "YES") {
              isCorrect = true;
            }

            if (parsed.suggestion && parsed.suggestion !== guess && normalizeGuess(parsed.suggestion) !== normalizedTarget) {
              suggestion = parsed.suggestion;
            }

            if (parsed.similarity_score !== undefined) {
              similarityScore = parsed.similarity_score;
            }
          }
        } catch (aiError) {
          console.error("AI matching error:", aiError);
        }
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabase.from("events").insert({
      challenge_id: payload.id,
      kind: "guess",
      meta: {
        guess: normalizedGuess,
        correct: isCorrect,
        phase: phase || 1,
        player_fingerprint,
      },
    });

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
