import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CATEGORIES = ["pop_culture", "history_science", "sports", "geography"] as const;
type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_WEIGHTS: Record<Difficulty, number> = {
  easy: 0.25,
  medium: 0.50,
  hard: 0.25,
};

function selectDifficulty(): Difficulty {
  const random = Math.random();
  let cumulative = 0;
  for (const [difficulty, weight] of Object.entries(DIFFICULTY_WEIGHTS)) {
    cumulative += weight;
    if (random < cumulative) {
      return difficulty as Difficulty;
    }
  }
  return "medium";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = tomorrow.toISOString().split("T")[0];

    console.log(`[Scheduled] Generating challenges for ${targetDate}`);

    const results: Record<string, { success: boolean; challenge_id?: string; error?: string }> = {};

    for (const category of CATEGORIES) {
      const { data: existing } = await supabase
        .from("daily_challenges")
        .select("challenge_id")
        .eq("challenge_date", targetDate)
        .eq("category", category)
        .maybeSingle();

      if (existing) {
        console.log(`[Scheduled] ${category} challenge for ${targetDate} already exists`);
        results[category] = { success: true, challenge_id: existing.challenge_id };
        continue;
      }

      const difficulty = selectDifficulty();
      console.log(`[Scheduled] Generating ${category} challenge with difficulty: ${difficulty}...`);
      const dailyChallengeUrl = `${supabaseUrl}/functions/v1/daily-challenge?category=${category}&difficulty=${difficulty}`;

      try {
        const response = await fetch(dailyChallengeUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${supabaseAnonKey}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Scheduled] Failed to generate ${category}:`, errorText);
          results[category] = { success: false, error: errorText };
        } else {
          const data = await response.json();
          console.log(`[Scheduled] Successfully generated ${category} challenge`);
          results[category] = { success: true, challenge_id: data.challenge_id };
        }
      } catch (err) {
        console.error(`[Scheduled] Error generating ${category}:`, err);
        results[category] = { success: false, error: err.message };
      }
    }

    const allSucceeded = Object.values(results).every(r => r.success);
    const successCount = Object.values(results).filter(r => r.success).length;

    return new Response(
      JSON.stringify({
        success: allSucceeded,
        message: `Generated ${successCount}/${CATEGORIES.length} challenges for ${targetDate}`,
        date: targetDate,
        results,
      }),
      { status: allSucceeded ? 200 : 207, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Scheduled] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});