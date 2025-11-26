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

  try {
    const { target, type, guesses, hints } = await req.json();

    if (!target || !type || !guesses || !hints) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: target, type, guesses, hints" }),
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

    const hintsSummary = `
Phase 1 (5 words): ${JSON.stringify(hints.phase1)}
Phase 2 (sentence): ${hints.phase2}
Phase 3 (5 categories): ${JSON.stringify(hints.phase3)}
${hints.phase4_nudge ? `Phase 4 (nudge): ${hints.phase4_nudge}` : ''}
`;

    const guessesSummary = guesses.map((g: string, i: number) => `${i + 1}. ${g}`).join('\n');

    const prompt = `You are helping a player in a deduction game where they must guess a ${type}. The answer is "${target}".

They have seen these hints:
${hintsSummary}

They have made these wrong guesses:
${guessesSummary}

YOUR TASK - Create a visual connection analysis:

1. SEMANTIC ANALYSIS: Rate each guess on how semantically close it is to the answer on a scale of 0-100
   - Consider conceptual similarity, category overlap, thematic connections
   - 0 = completely unrelated
   - 100 = extremely close (but not the answer)

2. CONNECTION MAPPING: Identify what connects each guess to the hints
   - Which hint led them to this guess?
   - What partial pattern did they identify?

3. SYNTHESIS SENTENCE: Write ONE powerful sentence that:
   - Describes the pattern shift they need to make
   - Connects all their attempts to the final answer WITHOUT revealing it
   - Is poetic but clear
   - Follows this format: "Across your guesses you've chased [theme1], [theme2], and [theme3]—all that's left is [final hint]"
   - MUST NOT contain ANY word from "${target}" (not even individual words!)

4. THEMES: Identify 2-3 themes they captured correctly, and 2-3 themes they missed
   - MUST NOT contain ANY word from "${target}" in any theme

CRITICAL RULES:
- NEVER mention the answer "${target}" in any reason, explanation, synthesis, or theme
- NEVER use ANY individual word from "${target}" anywhere in your response
- For "${target}", do not use any of these words: ${target.toLowerCase().split(/\s+/).filter((w: string) => w.length >= 3).join(', ')}
- Keep explanations focused on WHY the guess is close/far, not on comparing it to the answer by name
- Use general terms like "the answer", "the target", "it" instead of the actual name or any words from it

EXAMPLE for "cell phone" with guesses ["telephone", "radio", "computer", "tower", "satellite"]:
{
  "semantic_scores": [
    {"guess": "telephone", "score": 85, "reason": "Communication device with very similar function"},
    {"guess": "computer", "score": 70, "reason": "Modern technology with similar capabilities"},
    {"guess": "radio", "score": 60, "reason": "Wireless communication technology"},
    {"guess": "satellite", "score": 50, "reason": "Wireless signal transmission system"},
    {"guess": "tower", "score": 40, "reason": "Communication infrastructure component"}
  ],
  "connections": [
    {"guess": "telephone", "hint": "phase2", "pattern": "Identified communication aspect"},
    {"guess": "radio", "hint": "phase1", "pattern": "Picked up on wireless theme"},
    {"guess": "computer", "hint": "phase3", "pattern": "Connected to modern technology"},
    {"guess": "tower", "hint": "phase3", "pattern": "Focused on infrastructure"},
    {"guess": "satellite", "hint": "phase1", "pattern": "Signal and transmission"}
  ],
  "synthesis": "Across your guesses you've chased sound, size, and signal—all that's left is what fits in your hand.",
  "themes_identified": ["Communication", "Wireless technology", "Modern devices"],
  "themes_missing": ["Personal/portable", "Handheld size", "Multi-function tool"]
}

IMPORTANT:
- You MUST include themes_identified and themes_missing arrays with 2-3 items each
- NEVER use the answer's name OR any individual word from it in any explanation, synthesis, or theme
- Focus on characteristics, not comparisons to the specific answer
- Double-check your entire response to ensure NO words from "${target}" appear anywhere
Respond with ONLY a JSON object in this exact format.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: "You are a semantic analysis expert for a deduction game. Provide insightful connections and helpful guidance. Always include themes_identified and themes_missing in your response. CRITICAL: NEVER use the target answer OR any individual word from the answer in your explanations, synthesis sentence, or themes. This is absolutely forbidden."
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
