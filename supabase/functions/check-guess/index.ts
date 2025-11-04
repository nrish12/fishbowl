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
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { token, guess, phase, player_fingerprint } = await req.json();

    if (!token || !guess) {
      return new Response(
        JSON.stringify({ error: "Token and guess are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
        JSON.stringify({ error: "Token has expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (guess === '__reveal__') {
      return new Response(
        JSON.stringify({
          result: "reveal",
          canonical: payload.target,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedGuess = normalizeGuess(guess);
    const normalizedTarget = normalizeGuess(payload.target);
    const normalizedAliases = (payload.aliases || []).map(normalizeGuess);

    let isCorrect =
      normalizedGuess === normalizedTarget ||
      normalizedAliases.includes(normalizedGuess) ||
      normalizedGuess.includes(normalizedTarget) ||
      normalizedTarget.includes(normalizedGuess);

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
              messages: [{
                role: "user",
                content: `Is "${guess}" a valid way to refer to "${payload.target}"? Consider:\n- Misspellings\n- Abbreviations\n- Common variations\n- Partial names that are unambiguous\n\nRespond with only "YES" or "NO".`
              }],
              temperature: 0.1,
              max_tokens: 5,
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const aiAnswer = aiData.choices[0].message.content.trim().toUpperCase();
            if (aiAnswer === "YES") {
              isCorrect = true;
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