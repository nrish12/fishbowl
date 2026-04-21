import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getClientIdentifier } from "../_shared/rateLimit.ts";

type Category = "pop_culture" | "history_science" | "sports" | "geography" | null | undefined;

const CATEGORY_VOICES: Record<string, {
  system: string;
  tone: string;
  fallbackSynthesis: string;
  fallbackQuestions: Array<{ question: string; why: string }>;
}> = {
  pop_culture: {
    system: "You are a playful entertainment insider. Warm, teasing, references entertainment industry. Keep language casual and TV/movie/music fan-friendly.",
    tone: "a radio host coaching a caller",
    fallbackSynthesis: "Your guesses are circling pop culture but not landing the right era or medium.",
    fallbackQuestions: [
      { question: "What decade are we in — and is this TV, film, or music?", why: "Pinning the era and medium cuts the pool in half." },
      { question: "Is the person in front of the camera or behind it?", why: "Actors, hosts, and directors live in very different corners." },
    ],
  },
  history_science: {
    system: "You are a patient, curious professor. Informative and precise. Use educational language, like a teacher pointing at a timeline.",
    tone: "a professor narrowing down an era or discovery",
    fallbackSynthesis: "You're orbiting the right field but haven't pinned down the century or the figure.",
    fallbackQuestions: [
      { question: "What century are we in, and what's the field — physics, biology, politics?", why: "Era and discipline are the two biggest filters." },
      { question: "Is this person remembered for one big breakthrough or a body of work?", why: "It tells you whether to think narrow moment or long career." },
    ],
  },
  sports: {
    system: "You are a sports coach in the locker room. Punchy, confident. Use the language of stats, titles, and legendary moments.",
    tone: "a coach calling out what stat matters",
    fallbackSynthesis: "You're near the right sport but missing the era or the specific record.",
    fallbackQuestions: [
      { question: "What sport exactly, and what decade dominated?", why: "Sport plus era narrows it to a small list of legends." },
      { question: "Is this about a single record, a championship run, or a career?", why: "It changes whether you look for a peak season or a long arc." },
    ],
  },
  geography: {
    system: "You are an evocative travel guide. Paint sensory pictures — climate, landscape, nearby landmarks. Never name the place.",
    tone: "a travel guide describing a destination",
    fallbackSynthesis: "Your guesses sense the region but not the exact country or landmark.",
    fallbackQuestions: [
      { question: "What continent and climate — tropical, arid, temperate, polar?", why: "Continent plus climate rules out most of the map fast." },
      { question: "Is this a country, a city, or a single landmark?", why: "Scale changes what clues to lean on." },
    ],
  },
  default: {
    system: "You are a thoughtful game guide helping a player see what their guesses have in common.",
    tone: "a thoughtful guide",
    fallbackSynthesis: "Your guesses share a pattern but miss the distinguishing detail.",
    fallbackQuestions: [
      { question: "What do your guesses have in common?", why: "Finding the shared trait shows what you're over-weighting." },
      { question: "What's one trait that would set the answer apart from your guesses?", why: "That difference is usually the key the hints are pointing to." },
    ],
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

    let { token, guesses, hints } = await req.json();

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
        .eq("phase", "phase5")
        .eq("guesses_hash", guessesHash)
        .maybeSingle();

      if (cached?.response) {
        const tCache = Date.now();
        console.log(`[PERF] phase5-visual CACHE HIT | total:${tCache-t0}ms`);
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
          semantic_scores: [],
          connections: [],
          synthesis: voice.fallbackSynthesis,
          narrowing_questions: voice.fallbackQuestions,
          fallback: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    const prompt = `Answer: ${target} (${type}${category ? `, category: ${category}` : ""})
Hints: ${hintsSummary}
Guesses: ${guessesSummary}

Write in the voice of ${voice.tone}.

Task:
1. Rate each guess 0-100 based on conceptual similarity, category overlap, and thematic connections. Give a one-line reason in the category voice.
2. Write ONE synthesis sentence (max 18 words) in the category voice describing what the player's guesses have in common and what they are missing.
3. Write 2 NARROWING QUESTIONS the player should ask themselves to zero in on the answer. Each question should be in the category voice, and paired with a one-line "why" explaining how it narrows the search. Prefer questions about: era/time, place/region, profession/role, genre/field, scale, or a specific distinguishing trait. Do NOT ask questions whose answer reveals the target.

NEVER use these words: ${bannedWords}
VOCABULARY: simple 8th-grade words. Keep everything short and plain.

Return JSON:
{
  "semantic_scores": [{"guess": "...", "score": 0-100, "reason": "..."}],
  "connections": [{"guess": "...", "hint": "phase#", "pattern": "..."}],
  "synthesis": "One sentence in the ${voice.tone} voice",
  "narrowing_questions": [
    {"question": "...", "why": "..."},
    {"question": "...", "why": "..."}
  ]
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
          max_tokens: 500,
          messages: [
            { role: "system", content: voice.system + " Never use banned words. Return JSON only." },
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
      console.error("[phase5-visual] OpenAI error, returning fallback:", aiErr);
      return new Response(
        JSON.stringify({
          semantic_scores: [],
          connections: [],
          synthesis: voice.fallbackSynthesis,
          narrowing_questions: voice.fallbackQuestions,
          fallback: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedTarget = target.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");

    const filteredScores = (result.semantic_scores || []).filter((item: any) => {
      const normalizedGuess = (item.guess || "").toLowerCase().trim().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");
      return normalizedGuess !== normalizedTarget;
    }).slice(0, 4);

    const targetWords = target.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((word: string) => word.length >= 3);

    const sanitizeText = (text: string): string => {
      if (!text) return text;
      let sanitized = text;
      targetWords.forEach((word: string) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        sanitized = sanitized.replace(regex, '[...]');
      });
      return sanitized;
    };

    const sanitizedScores = filteredScores.map((item: any) => ({
      ...item,
      reason: sanitizeText(item.reason),
    }));

    const rawQuestions = Array.isArray(result.narrowing_questions) ? result.narrowing_questions : [];
    const sanitizedQuestions = rawQuestions
      .filter((q: any) => q && typeof q.question === "string" && typeof q.why === "string")
      .slice(0, 3)
      .map((q: any) => ({
        question: sanitizeText(q.question),
        why: sanitizeText(q.why),
      }));

    const finalQuestions = sanitizedQuestions.length > 0 ? sanitizedQuestions : voice.fallbackQuestions;

    const t2 = Date.now();
    console.log(`[PERF] phase5-visual | jwt:${t1-t0}ms openai:${t2-t1}ms total:${t2-t0}ms`);

    const finalResponse = {
      semantic_scores: sanitizedScores,
      connections: result.connections || [],
      synthesis: sanitizeText(result.synthesis) || voice.fallbackSynthesis,
      narrowing_questions: finalQuestions,
    };

    if (challengeId) {
      supabase
        .from("nudge_cache")
        .upsert({
          challenge_id: challengeId,
          phase: "phase5",
          guesses_hash: guessesHash,
          response: finalResponse,
        }, { onConflict: "challenge_id,phase,guesses_hash" })
        .then(({ error }: any) => {
          if (error) console.error("[phase5-visual] cache write failed:", error);
        });
    }

    return new Response(
      JSON.stringify(finalResponse),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred generating the visual analysis" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
