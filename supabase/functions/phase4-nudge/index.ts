import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { checkRateLimit, getClientIdentifier } from "../_shared/rateLimit.ts";

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
    const clientId = getClientIdentifier(req);
    const rateLimit = await checkRateLimit(clientId, {
      maxRequests: 20,
      windowMs: 60000,
    });

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again in a minute.",
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

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

    // Build a summary of what the user has seen and guessed
    const hintsSummary = `
Phase 1 (5 words): ${JSON.stringify(hints.phase1)}
Phase 2 (sentence): ${hints.phase2}
Phase 3 (5 categories): ${JSON.stringify(hints.phase3)}
`;

    const guessesSummary = guesses.map((g: string, i: number) => `${i + 1}. ${g}`).join('\n');

    const prompt = `You are helping a player in a deduction game where they must guess: ${target} (a ${type}).

They have seen these hints:
${hintsSummary}

They have made these guesses:
${guessesSummary}

YOUR TASK:
1. Pick 2-3 keywords from the hints and guesses
2. Calculate their semantic overlap with the correct answer
3. Order them from most→least relevant
4. Write ONE sentence (exactly 12 words) that synthesizes the pattern and nudges them closer to the answer

The sentence should:
- Be conversational, like you're speaking to them directly
- Connect the dots between what they've guessed and what they haven't figured out
- NOT give away the answer, but make them think "Ohh, I need to think about X"
- Be exactly 12 words

EXAMPLE for "cell phone":
"Across your guesses you've chased sound, size, and signal—all that's left is what fits in your hand."

Respond with ONLY a JSON object:
{
  "nudge": "your 12-word sentence here",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "relevance_order": ["most relevant", "medium relevant", "least relevant"]
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "You are a creative game assistant who provides helpful nudges without giving away answers."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI failed: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify({
        nudge: result.nudge,
        keywords: result.keywords,
        relevance_order: result.relevance_order,
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
