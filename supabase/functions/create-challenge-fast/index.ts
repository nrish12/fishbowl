import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: scorePrompt }],
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
  "status": "APPROVED" or "REJECTED",
  "fame_score": 0-5,
  "reason": "clear explanation",
  "suggestion": "if rejected, provide alternative"
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
- Use VERY ABSTRACT and SUBTLE words
- Cryptic associations that require deep thought
- Avoid obvious connections - think laterally

PHASE 2 - One Sentence (3 variations):

EASIER Version:
- Be EXTREMELY SPECIFIC with unmistakable details
- ${phase2Guidance}

MEDIUM Version:
- Be MODERATELY SPECIFIC with some inference required
- Use less direct language than easier version

HARDER Version:
- Be CRYPTIC but still informative (not purely poetic)
- Use indirect language and lateral thinking
- Describe specific details in an abstract way
- Should make people think, but still be solvable with logic

Phase 3 - Five categories (same for all difficulties):
${phase3Guidance}

Generate aliases/variations for matching guesses.

CRITICAL REMINDERS:
- Phase 1 variations must use COMPLETELY DIFFERENT WORDS from each other
- Phase 2 variations must approach the subject from DIFFERENT ANGLES
- NO word or concept should appear in multiple difficulty levels

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
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: validationPrompt }],
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
          model: "gpt-4o",
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
        aliases: hints.aliases || [target],
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
