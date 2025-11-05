import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

interface ChallengeRequest {
  type: "person" | "place" | "thing";
  target: string;
  confirmed?: boolean;
}

Deno.serve(async (req: Request) => {

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { type, target }: ChallengeRequest = await req.json();

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

    const validationPrompt = `You are a gatekeeper for a public guessing game. Your task is to evaluate whether the following ${type} is suitable for the game.

Rejection criteria:
- Private individuals or non-public figures
- Minors (under 18)
- Hate speech, NSFW content, or doxxing
- Extremely obscure subjects that a global audience wouldn't recognize

Fame score scale (0-5):
- 0-2: Too obscure, reject
- 3: Recognizable to informed audiences, minimum acceptable
- 4: Well-known to general audiences
- 5: Globally famous, household name

Input target: ${type}:${target}

IMPORTANT CHECKS:
1. MISSPELLING: If the input appears to be a misspelling of a famous ${type}, return status "NEEDS_CLARIFICATION" with the corrected name
2. DISAMBIGUATION: If there are multiple famous ${type}s with this exact name (e.g., multiple celebrities, different locations), return status "NEEDS_DISAMBIGUATION" with up to 5 most famous options
3. Otherwise, evaluate normally

Respond with ONLY valid JSON in one of these formats:

For misspellings:
{
  "status": "NEEDS_CLARIFICATION",
  "corrected_name": "the correct spelling",
  "reason": "friendly message explaining the misspelling"
}

For disambiguation (multiple people/places/things with same name):
{
  "status": "NEEDS_DISAMBIGUATION",
  "disambiguation_options": [
    {"name": "Full specific name/title", "description": "brief distinguishing detail (occupation, era, location, etc.)"},
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

    const validationResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
    });

    if (!validationResponse.ok) {
      const errorData = await validationResponse.json();
      if (errorData.error?.code === "insufficient_quota") {
        return new Response(
          JSON.stringify({ 
            error: "Service temporarily unavailable",
            reason: "The AI service has reached its usage limit. Please try again later or contact support."
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
          suggestion: validationResult.suggestion || `Try choosing a more well-known ${type}. ${type === 'thing' ? 'Consider iconic inventions, famous artworks, or globally recognized brands and products.' : type === 'person' ? 'Consider historical figures, celebrities, or influential leaders.' : 'Consider world-famous landmarks or major cities.'}`,
          fame_score: validationResult.fame_score,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let phase2Guidance = '';
    let phase3Guidance = '';

    if (type === 'person') {
      phase2Guidance = '- Focus on a UNIQUE achievement, defining moment, or specific contribution\n- Be CONCRETE and SPECIFIC, not generic\n- Include distinctive details that narrow it down significantly\n- Avoid vague descriptions like "known for" - state WHAT specifically they did';
      phase3Guidance = '- geography: Specific birthplace, country represented, or key location (be precise with city/region)\n- history: Exact timeframe and specific historical impact with dates or era\n- culture: Specific cultural contribution, movement founded, or lasting legacy\n- stats: Concrete numbers - awards won, records held, years active, specific achievements\n- visual: Distinctive physical traits, signature style, iconic appearance details';
    } else if (type === 'place') {
      phase2Guidance = '- Focus on a UNIQUE characteristic, historical event, or distinctive feature\n- Be CONCRETE and SPECIFIC with details\n- Should significantly narrow down possibilities\n- Avoid generic location descriptions';
      phase3Guidance = '- geography: Precise location with continent, country, region, coordinates or nearby landmarks\n- history: Specific founding date, historical events that happened there, age\n- culture: Unique cultural practices, famous events held there, UNESCO status\n- stats: Exact measurements - height, size, population, visitor numbers, area\n- visual: Distinctive architectural features, natural characteristics, iconic views';
    } else {
      phase2Guidance = '- Focus on SPECIFIC impact, innovation, or defining characteristic\n- Be CONCRETE with details about what makes it unique\n- Should significantly narrow down possibilities\n- Avoid generic "well-known" or "popular" descriptions';
      phase3Guidance = '- geography: Specific origin country, where it was created/invented, where it is primarily found\n- history: Exact year invented/created, historical context, evolution timeline\n- culture: Specific cultural impact, who uses it, cultural significance\n- stats: Concrete numbers - units sold, dimensions, speed, capacity, price range\n- visual: Precise physical characteristics, materials, colors, distinctive design elements';
    }

    const hintPrompt = `Generate hints for a deduction game where players must guess: ${target} (a ${type}).

CRITICAL: Generate 3 DRAMATICALLY DIFFERENT difficulty levels. The variations MUST feel significantly different from each other.

PHASE 1 - Five Single Words (3 variations with DISTINCT approaches):

EASIER Version:
- Use VERY DIRECT and OBVIOUS words that almost give it away
- Include the most iconic and recognizable associations
- Words should be what people IMMEDIATELY think of
- Almost too easy - the first things that come to mind
- Example approach: most famous attributes, direct category names, obvious symbols

MEDIUM Version:
- Use SOMEWHAT REVEALING words that require thinking
- Balance between obvious and abstract
- Include broader themes and contexts
- Requires knowledge but not deep expertise
- Example approach: broader themes, related concepts, cultural associations

HARDER Version:
- Use VERY ABSTRACT and SUBTLE words
- Cryptic associations that require deep thought
- Avoid obvious connections - think laterally
- Could apply to multiple things until you connect all five
- Example approach: sensory details, abstract concepts, peripheral associations

PHASE 2 - One Sentence (3 variations with DISTINCT specificity levels):

EASIER Version:
- Be EXTREMELY SPECIFIC with unmistakable details
- Include the most recognizable facts or characteristics
- Use terminology and details that are well-known
- Almost impossible to miss if you know the subject at all
- ${phase2Guidance}

MEDIUM Version:
- Be MODERATELY SPECIFIC with some inference required
- Include details that are known but not the most obvious ones
- Require connecting a few pieces of information
- Someone with general knowledge could figure it out
- Use less direct language than easier version

HARDER Version:
- Be VERY CRYPTIC and ABSTRACT
- Use poetic or metaphorical language
- Avoid explicit mentions of the most famous aspects
- Require significant deduction and lateral thinking
- Should feel like a riddle that clicks once you get it

Phase 3 - Five categories (same for all difficulties):
${phase3Guidance}

Generate aliases/variations for matching guesses (common misspellings, abbreviations, alternative names).

CRITICAL REMINDERS:
- Phase 1 variations must use COMPLETELY DIFFERENT WORDS from each other
- Phase 2 variations must approach the subject from DIFFERENT ANGLES
- NO word or concept should appear in multiple difficulty levels of the same phase
- The three difficulties should feel like three different people wrote them

Respond with ONLY valid JSON:
{
  "phase1_options": [
    ["word1", "word2", "word3", "word4", "word5"],
    ["word1", "word2", "word3", "word4", "word5"],
    ["word1", "word2", "word3", "word4", "word5"]
  ],
  "phase2_options": [
    "easier sentence with more revealing details",
    "medium difficulty sentence with balanced details",
    "harder sentence with more subtle details"
  ],
  "phase3": {
    "geography": "specific location details",
    "history": "specific dates and historical facts",
    "culture": "specific cultural impact and significance",
    "stats": "concrete numbers and measurements",
    "visual": "specific physical characteristics and appearance"
  },
  "aliases": ["variation1", "variation2", "variation3"]
}`;

    const hintResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "You are a creative puzzle designer who excels at creating dramatically different difficulty levels. Your variations should feel like they were written by different people with different approaches. Avoid repetition and overlap at all costs."
          },
          { role: "user", content: hintPrompt }
        ],
        temperature: 0.9,
        response_format: { type: "json_object" },
      }),
    });

    if (!hintResponse.ok) {
      const errorData = await hintResponse.json();
      if (errorData.error?.code === "insufficient_quota") {
        return new Response(
          JSON.stringify({ 
            error: "Service temporarily unavailable",
            reason: "The AI service has reached its usage limit. Please try again later or contact support."
          }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`OpenAI hint generation failed: ${JSON.stringify(errorData)}`);
    }

    const hintData = await hintResponse.json();
    const hintContent = hintData.choices[0].message.content;
    const hints = extractJSON(hintContent);

    const challengeId = crypto.randomUUID();

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
