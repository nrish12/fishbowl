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

    const bannedWords = target.toLowerCase().split(/\s+/).filter((w: string) => w.length >= 3).join(', ');
    const prompt = `Answer: ${target} (${type})
Hints: ${hintsSummary}
Guesses: ${guessesSummary}

Rate each guess 0-100 (conceptual similarity, category overlap, themes). Never use these words: ${bannedWords}

Example JSON:
{
  "semantic_scores": [
    {"guess": "telephone", "score": 85, "reason": "Communication device, very similar function"},
    {"guess": "computer", "score": 70, "reason": "Modern tech, similar capabilities"}
  ],
  "connections": [
    {"guess": "telephone", "hint": "phase2", "pattern": "Communication aspect"}
  ],
  "synthesis": "Across your guesses you've chased sound and signal—all that's left is what fits in your hand.",
  "themes_identified": ["Communication", "Wireless tech"],
  "themes_missing": ["Portable", "Handheld"]
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
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: "You analyze guesses semantically. Be concise. Never use banned words."
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
