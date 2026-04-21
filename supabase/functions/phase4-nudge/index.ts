import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getClientIdentifier } from "../_shared/rateLimit.ts";

type Category = "pop_culture" | "history_science" | "sports" | "geography" | null | undefined;

const CATEGORY_VOICES: Record<string, { system: string; tone: string; fallback: string }> = {
  pop_culture: {
    system: "You are a playful entertainment insider giving a radio-host style hint. Warm, teasing, references entertainment industry, uses casual language a fan of TV/movies/music would recognize.",
    tone: "a radio host who teases celebrities",
    fallback: "Think about who's lighting up the red carpets and what decade made them unmissable.",
  },
  history_science: {
    system: "You are a patient, curious professor giving a measured hint. Informative, precise, uses educational language — the kind of teacher who points at a map or a timeline.",
    tone: "a professor narrowing down an era or discovery",
    fallback: "Pin down the century and the field of work first, then who made the breakthrough people still cite today.",
  },
  sports: {
    system: "You are a sports coach in the locker room giving a direct, motivational hint. Punchy, confident, uses the language of stats, titles, and legendary moments.",
    tone: "a coach naming what stat or sport matters most",
    fallback: "Lock in the sport, then the era. Who held the record or trophy everyone talks about?",
  },
  geography: {
    system: "You are an evocative travel guide giving an atmospheric hint. Paints a sensory picture — climate, landscape, famous nearby landmarks — without naming the place.",
    tone: "a travel guide describing a destination",
    fallback: "Picture the climate, the terrain, and one landmark nearby. What continent are you standing on?",
  },
  default: {
    system: "You are a helpful game master giving a personalized hint based on a player's wrong guesses.",
    tone: "a thoughtful guide",
    fallback: "Look at what your guesses have in common, then think about the one thing that makes the answer different.",
  },
};

function categoryKey(category: Category): string {
  if (!category) return "default";
  return CATEGORY_VOICES[category] ? category : "default";
}

async function hashGuesses(guesses: string[]): Promise<string> {
  const sorted = [...guesses].map(g => g.toLowerCase().trim()).sort().join("|");
  const data = new TextEncoder().encode(sorted);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

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

    let { token, guesses, hints, similarity_scores } = await req.json();

    if (!token || !guesses || !hints) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: token, guesses, hints" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
      payload = JSON.parse(atob(payloadPadded));
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
    const category = payload.category as Category;
    const challengeId = payload.id;
    const voice = CATEGORY_VOICES[categoryKey(category)];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const guessesHash = await hashGuesses(guesses);

    if (challengeId) {
      const { data: cached } = await supabase
        .from("nudge_cache")
        .select("response")
        .eq("challenge_id", challengeId)
        .eq("phase", "phase4")
        .eq("guesses_hash", guessesHash)
        .maybeSingle();

      if (cached?.response) {
        const tCache = Date.now();
        console.log(`[PERF] phase4-nudge CACHE HIT | total:${tCache-t0}ms`);
        return new Response(
          JSON.stringify({ ...cached.response, cached: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const t1 = Date.now();
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({
          nudge: voice.fallback,
          keywords: [],
          pattern_identified: null,
          fallback: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hintsSummary = `
Phase 1 (5 words): ${JSON.stringify(hints.phase1)}
Phase 2 (sentence): ${hints.phase2}
Phase 3 (5 categories): ${JSON.stringify(hints.phase3)}
`;

    const scoreLookup = new Map<string, number>();
    if (similarity_scores && typeof similarity_scores === "object") {
      for (const [g, s] of Object.entries(similarity_scores)) {
        if (typeof s === "number") scoreLookup.set(g.toLowerCase().trim(), s);
      }
    }

    const guessesSummary = guesses
      .map((g: string, i: number) => {
        const score = scoreLookup.get(g.toLowerCase().trim());
        return `${i + 1}. "${g}"${typeof score === "number" ? ` (similarity ${score}%)` : ""}`;
      })
      .join("\n");

    const closestGuess = [...guesses]
      .map((g: string) => ({ g, s: scoreLookup.get(g.toLowerCase().trim()) ?? 0 }))
      .sort((a, b) => b.s - a.s)[0];

    const prompt = `Answer: "${target}" (a ${type}${category ? `, category: ${category}` : ""})

Player's hints so far:
${hintsSummary}

Player's wrong guesses${closestGuess?.s ? ` (closest was "${closestGuess.g}" at ${closestGuess.s}%)` : ""}:
${guessesSummary}

Write your nudge as ${voice.tone}.

Your nudge MUST:
1. Name the exact DIMENSION the player is missing on. Pick one: era/time, place/region, profession/role, genre/field, scale/size, or specific trait.
2. Anchor on the closest wrong guess. Say something like "You're close on X but you're off on Y".
3. Give one SPECIFIC distinguishing detail about "${target}" along that dimension.
4. Do NOT reveal the answer or any word from it.
5. 18-25 words total, conversational, in the voice of ${voice.tone}.

VOCABULARY: simple 8th-grade words. "famous" not "renowned", "show" not "exemplify".

Return JSON:
{
  "nudge": "Your 18-25 word hint in the category voice, naming the missing dimension",
  "keywords": ["3", "distinguishing", "words"],
  "pattern_identified": "1-sentence description of what the player seems to be thinking",
  "dimension_off": "era" | "place" | "profession" | "genre" | "scale" | "trait"
}`;

    let result: any;
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.7,
          max_tokens: 220,
          messages: [
            { role: "system", content: voice.system },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI failed: ${response.status}`);
      }

      const data = await response.json();
      result = JSON.parse(data.choices[0].message.content);
    } catch (aiErr) {
      console.error("[phase4-nudge] OpenAI error, returning fallback:", aiErr);
      const fallbackResponse = {
        nudge: voice.fallback,
        keywords: [],
        pattern_identified: null,
        fallback: true,
      };
      return new Response(
        JSON.stringify(fallbackResponse),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const t2 = Date.now();
    console.log(`[PERF] phase4-nudge | jwt:${t1-t0}ms openai:${t2-t1}ms total:${t2-t0}ms`);

    const response = {
      nudge: result.nudge,
      keywords: result.keywords || [],
      pattern_identified: result.pattern_identified || null,
      dimension_off: result.dimension_off || null,
    };

    if (challengeId) {
      supabase
        .from("nudge_cache")
        .upsert({
          challenge_id: challengeId,
          phase: "phase4",
          guesses_hash: guessesHash,
          response,
        }, { onConflict: "challenge_id,phase,guesses_hash" })
        .then(({ error }: any) => {
          if (error) console.error("[phase4-nudge] cache write failed:", error);
        });
    }

    return new Response(
      JSON.stringify(response),
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
