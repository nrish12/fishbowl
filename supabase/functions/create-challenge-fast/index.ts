import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { checkRateLimit, getClientIdentifier } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  "Access-Control-Max-Age": "86400",
};

function extractJSON(text: string): any {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(text);
}

function enhanceAliases(target: string, aiAliases: string[], type: string): string[] {
  const aliases = new Set<string>();

  // Always include the target
  aliases.add(target);

  // Include AI-generated aliases
  aiAliases.forEach(alias => aliases.add(alias));

  const words = target.split(" ");
  const targetLower = target.toLowerCase();

  // Common abbreviations for people
  if (type === "person") {
    // Add initials (e.g., "MLK" for "Martin Luther King")
    if (words.length >= 2) {
      const initials = words.map(w => w[0]).join("");
      if (initials.length >= 2) aliases.add(initials);
    }

    // Add first name only if unique enough
    if (words.length >= 2) {
      aliases.add(words[0]);
    }

    // Add last name only
    if (words.length >= 2) {
      aliases.add(words[words.length - 1]);
    }

    // Common nicknames
    if (targetLower.includes("william")) aliases.add(target.replace(/william/i, "Bill"));
    if (targetLower.includes("robert")) aliases.add(target.replace(/robert/i, "Bob"));
    if (targetLower.includes("elizabeth")) aliases.add(target.replace(/elizabeth/i, "Liz"));
    if (targetLower.includes("alexander")) aliases.add(target.replace(/alexander/i, "Alex"));
    if (targetLower.includes("benjamin")) aliases.add(target.replace(/benjamin/i, "Ben"));
  }

  // Common abbreviations for places
  if (type === "place") {
    // Add "the" prefix variations
    if (!targetLower.startsWith("the ")) {
      aliases.add(`The ${target}`);
    } else {
      aliases.add(target.substring(4)); // Remove "the "
    }

    // Common place abbreviations
    if (targetLower.includes("mount ")) aliases.add(target.replace(/mount /i, "Mt. "));
    if (targetLower.includes("mt. ")) aliases.add(target.replace(/mt\. /i, "Mount "));
    if (targetLower.includes("saint ")) aliases.add(target.replace(/saint /i, "St. "));
    if (targetLower.includes("st. ")) aliases.add(target.replace(/st\. /i, "Saint "));
  }

  // Common abbreviations for things
  if (type === "thing") {
    // Add "the" prefix variations
    if (!targetLower.startsWith("the ")) {
      aliases.add(`The ${target}`);
    } else {
      aliases.add(target.substring(4));
    }
  }

  // Remove any that are just the target again
  const finalAliases = Array.from(aliases).filter(a => a && a.trim().length > 0);

  // Remove duplicates when lowercased
  const seen = new Set<string>();
  return finalAliases.filter(alias => {
    const lower = alias.toLowerCase().trim();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}

interface ValidationResult {
  status: "APPROVED" | "REJECTED" | "NEEDS_CLARIFICATION" | "NEEDS_DISAMBIGUATION";
  fame_score: number;
  reason: string;
  suggestion?: string;
  corrected_name?: string;
  disambiguation_options?: Array<{
    name: string;
    description: string;
  }>;
}

async function scoreHintQuality(
  hints: any,
  target: string,
  type: string,
  openaiKey: string
): Promise<any> {
  const scorePrompt = `You are a quality control AI for a guessing game.

Rate these hints for guessing "${target}" (a ${type}) on a scale of 0-100:

Phase 1 Options:
${JSON.stringify(hints.phase1_options, null, 2)}

Phase 2 Options:
${JSON.stringify(hints.phase2_options, null, 2)}

Phase 3:
${JSON.stringify(hints.phase3, null, 2)}

Scoring criteria:
- Distinct difficulty levels (30 points): Are the 3 versions clearly different?
- No overlap (20 points): Do variations avoid repeating words/concepts?
- Appropriate challenge (20 points): Not too easy, not impossible
- Engaging language (15 points): Interesting, not boring
- Accuracy (15 points): All hints are factually correct

Respond with ONLY a JSON object:
{
  "score": 0-100,
  "issues": ["specific problems if score < 80"],
  "strengths": ["what worked well"]
}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.1-chat-latest",
        messages: [
          { role: "system", content: "You are a helpful assistant that responds in JSON format." },
          { role: "user", content: scorePrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.warn("Quality scoring failed, skipping");
      return { score: 75, issues: [], strengths: [] };
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Quality scoring error:", error);
    return { score: 75, issues: [], strengths: [] };
  }
}

Deno.serve(async (req: Request) => {

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const clientId = getClientIdentifier(req);
    const rateLimit = await checkRateLimit(clientId, {
      maxRequests: 10,
      windowMs: 60000,
    });

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again in a minute.",
          resetAt: new Date(rateLimit.resetAt).toISOString(),
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.resetAt.toString(),
          },
        }
      );
    }

    const { type, target } = await req.json();

    if (!type || !target || !["person", "place", "thing"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: type must be person, place, or thing" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validationPrompt = `You are a gatekeeper for a public guessing game. Evaluate whether "${target}" (a ${type}) is suitable.

Rejection criteria:
- Private individuals or non-public figures
- Minors (under 18)
- Hate speech, NSFW content, or doxxing
- Extremely obscure subjects

Fame score scale (0-5):
- 0-2: Too obscure, reject
- 3: Recognizable to informed audiences, minimum acceptable
- 4: Well-known to general audiences
- 5: Globally famous, household name

IMPORTANT CHECKS:
1. MISSPELLING: If the input appears to be a misspelling of a famous ${type}, return status "NEEDS_CLARIFICATION" with the corrected name
2. DISAMBIGUATION: If there are multiple famous ${type}s with this exact name, return status "NEEDS_DISAMBIGUATION" with up to 5 most famous options
3. Otherwise, evaluate normally

For misspellings:
{
  "status": "NEEDS_CLARIFICATION",
  "corrected_name": "the correct spelling",
  "reason": "friendly message explaining the misspelling"
}

For disambiguation:
{
  "status": "NEEDS_DISAMBIGUATION",
  "disambiguation_options": [
    {"name": "Full specific name/title", "description": "brief distinguishing detail"},
    {"name": "Another option", "description": "distinguishing detail"}
  ],
  "reason": "There are multiple famous ${type}s with this name"
}

For normal approval/rejection:
{
  "status": "APPROVED",
  "fame_score": 4,
  "reason": "clear explanation"
}

OR

{
  "status": "REJECTED",
  "fame_score": 1,
  "reason": "clear explanation",
  "suggestion": "alternative suggestion"
}`;

    let phase2Guidance = '';
    let phase3Guidance = '';

    if (type === 'person') {
      phase2Guidance = '- Focus on a UNIQUE achievement, defining moment, or specific contribution\n- Be CONCRETE and SPECIFIC, not generic\n- Include distinctive details that narrow it down significantly\n- Avoid vague descriptions like "known for" - state WHAT specifically they did';
      phase3Guidance = '- geography: Specific birthplace, country represented, or key location (be precise with city/region)\n- history: Exact timeframe and specific historical impact with dates or era\n- culture: Specific cultural contribution, movement founded, or lasting legacy\n- stats: Concrete numbers - awards won, records held, years active, specific achievements\n- visual: Distinctive physical traits, signature style, iconic appearance details';
    } else if (type === 'place') {
      phase2Guidance = '- Focus on a UNIQUE characteristic, historical event, or distinctive feature\n- Be CONCRETE and SPECIFIC with details\n- Should significantly narrow down possibilities\n- Avoid generic location descriptions';
      phase3Guidance = '- geography: Precise location with continent, region, or nearby landmarks (DO NOT state what country it is the capital of)\n- history: Specific founding date, historical events that happened there, age\n- culture: Unique cultural practices, famous events held there, UNESCO status\n- stats: Exact measurements - height, size, population, visitor numbers, area\n- visual: Distinctive architectural features, natural characteristics, iconic views';
    } else {
      phase2Guidance = '- Focus on SPECIFIC impact, innovation, or defining characteristic\n- Be CONCRETE with details about what makes it unique\n- Should significantly narrow down possibilities\n- Avoid generic "well-known" or "popular" descriptions';
      phase3Guidance = '- geography: Specific origin country, where it was created/invented, where it is primarily found\n- history: Exact year invented/created, historical context, evolution timeline\n- culture: Specific cultural impact, who uses it, cultural significance\n- stats: Concrete numbers - units sold, dimensions, speed, capacity, price range\n- visual: Precise physical characteristics, materials, colors, distinctive design elements';
    }

    const hintPrompt = `Generate hints for a deduction game where players must guess: ${target} (a ${type}).

CRITICAL: Generate 3 DRAMATICALLY DIFFERENT difficulty levels.

PHASE 1 - Five Single Words (3 variations with DISTINCT approaches):

CRITICAL: NEVER use words that are part of the actual name. For example:
- For "Budapest", NEVER use "Buda" or "Pest"
- For "Will Smith", NEVER use "Will" or "Smith"
- For "New York", NEVER use "New" or "York"

EASIER Version:
- Use VERY DIRECT and OBVIOUS words that almost give it away
- Include the most iconic and recognizable associations
- Words should be what people IMMEDIATELY think of

MEDIUM Version:
- Use SOMEWHAT REVEALING words that require thinking
- Balance between obvious and abstract
- Include broader themes and contexts

HARDER Version:
- Use VERY ABSTRACT and SUBTLE words (but still factual)
- Cryptic associations that require deep thought
- Avoid obvious connections - think laterally
- NO purely abstract concepts - words should still relate to real facts

PHASE 2 - One Sentence (3 variations):

EASIER Version:
- Be EXTREMELY SPECIFIC with unmistakable details
- ${phase2Guidance}

MEDIUM Version:
- Be MODERATELY SPECIFIC with some inference required
- Use factual but less direct language than easier version
- NO poetic language - stick to concrete details

HARDER Version:
- Be CHALLENGING BUT FAIR - make them think hard, but it should be solvable
- Use indirect but FACTUAL descriptions - avoid obvious connections
- Describe SPECIFIC CONCRETE FACTS from an unexpected angle
- Focus on lesser-known but verifiable details
- Test their knowledge, but don't make it impossible
- NO cryptic wordplay or overly abstract metaphors

Phase 3 - Five categories (same for all difficulties):
${phase3Guidance}

Generate basic aliases/variations for matching guesses (common spellings, abbreviations).

CRITICAL REMINDERS:
- Phase 1 variations must use COMPLETELY DIFFERENT WORDS from each other
- Phase 2 variations must approach the subject from DIFFERENT ANGLES
- NO word or concept should appear in multiple difficulty levels
- Aliases should include common variations, misspellings, abbreviations

Respond with ONLY valid JSON:
{
  "phase1_options": [
    ["word1", "word2", "word3", "word4", "word5"],
    ["word1", "word2", "word3", "word4", "word5"],
    ["word1", "word2", "word3", "word4", "word5"]
  ],
  "phase2_options": [
    "easier sentence",
    "medium sentence",
    "harder sentence"
  ],
  "phase3": {
    "geography": "specific location details",
    "history": "specific dates and historical facts",
    "culture": "specific cultural impact",
    "stats": "concrete numbers",
    "visual": "specific physical characteristics"
  },
  "aliases": ["variation1", "variation2", "variation3"]
}`;

    const [validationResponse, hintResponse] = await Promise.all([
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5.1-chat-latest",
          messages: [
            { role: "system", content: "You are a helpful assistant that responds in JSON format." },
            { role: "user", content: validationPrompt }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      }),

      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5.1-chat-latest",
          messages: [
            {
              role: "system",
              content: "You are a creative puzzle designer who excels at creating dramatically different difficulty levels. Avoid repetition at all costs."
            },
            { role: "user", content: hintPrompt }
          ],
          temperature: 0.9,
          response_format: { type: "json_object" },
        }),
      }),
    ]);

    if (!validationResponse.ok) {
      const errorData = await validationResponse.json();
      if (errorData.error?.code === "insufficient_quota") {
        return new Response(
          JSON.stringify({
            error: "Service temporarily unavailable",
            reason: "The AI service has reached its usage limit. Please try again later."
          }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`OpenAI validation failed: ${JSON.stringify(errorData)}`);
    }

    const validationData = await validationResponse.json();
    const validationContent = validationData.choices[0].message.content;
    const validationResult: ValidationResult = extractJSON(validationContent);

    if (validationResult.status === "NEEDS_CLARIFICATION") {
      return new Response(
        JSON.stringify({
          status: "needs_clarification",
          corrected_name: validationResult.corrected_name,
          reason: validationResult.reason,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (validationResult.status === "NEEDS_DISAMBIGUATION") {
      return new Response(
        JSON.stringify({
          status: "needs_disambiguation",
          options: validationResult.disambiguation_options,
          reason: validationResult.reason,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (validationResult.status === "REJECTED" || validationResult.fame_score < 3) {
      return new Response(
        JSON.stringify({
          error: "Challenge rejected",
          reason: validationResult.reason,
          suggestion: validationResult.suggestion || `Try choosing a more well-known ${type}.`,
          fame_score: validationResult.fame_score,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hintResponse.ok) {
      const errorData = await hintResponse.json();
      if (errorData.error?.code === "insufficient_quota") {
        return new Response(
          JSON.stringify({
            error: "Service temporarily unavailable",
            reason: "The AI service has reached its usage limit. Please try again later."
          }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`OpenAI hint generation failed: ${JSON.stringify(errorData)}`);
    }

    const hintData = await hintResponse.json();
    const hintContent = hintData.choices[0].message.content;
    const hints = extractJSON(hintContent);

    // Enhance aliases with common variations
    const enhancedAliases = enhanceAliases(target, hints.aliases || [], type);

    const qualityScore = await scoreHintQuality(hints, target, type, openaiKey);

    console.log(`Quality score for "${target}": ${qualityScore.score}/100`);

    if (qualityScore.score < 70) {
      console.log("Low quality hints detected:", qualityScore.issues);
    }

    const challengeId = crypto.randomUUID();

    fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/challenge_quality_scores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        challenge_id: challengeId,
        quality_score: qualityScore.score,
        issues: qualityScore.issues,
        strengths: qualityScore.strengths,
        regenerated: false,
      }),
    }).catch(err => console.warn("Failed to store quality score:", err));

    return new Response(
      JSON.stringify({
        challenge_id: challengeId,
        type,
        target,
        fame_score: validationResult.fame_score,
        phase1_options: hints.phase1_options,
        phase2_options: hints.phase2_options,
        phase3: hints.phase3,
        aliases: enhancedAliases,
        quality_score: qualityScore.score,
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