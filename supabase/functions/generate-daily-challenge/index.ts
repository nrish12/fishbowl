import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CATEGORIES = ["pop_culture", "history_science", "sports", "geography"] as const;
type Category = typeof CATEGORIES[number];
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

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateChallengeWithRetry(
  supabaseUrl: string,
  supabaseAnonKey: string,
  category: Category,
  maxRetries: number = 3,
  baseDelayMs: number = 2000
): Promise<{ success: boolean; challenge_id?: string; error?: string }> {

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const difficulty = selectDifficulty();
    console.log(`[Scheduled] Attempt ${attempt}/${maxRetries} for ${category} with difficulty: ${difficulty}`);

    try {
      const dailyChallengeUrl = `${supabaseUrl}/functions/v1/daily-challenge?category=${category}&difficulty=${difficulty}`;

      const response = await fetch(dailyChallengeUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${supabaseAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[Scheduled] Successfully generated ${category} challenge on attempt ${attempt}`);
        return { success: true, challenge_id: data.challenge_id };
      }

      const errorText = await response.text();
      console.error(`[Scheduled] Attempt ${attempt} failed for ${category}:`, errorText);

      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.log(`[Scheduled] Waiting ${delay}ms before retry...`);
        await sleep(delay);
      }
    } catch (err) {
      console.error(`[Scheduled] Attempt ${attempt} error for ${category}:`, err);

      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.log(`[Scheduled] Waiting ${delay}ms before retry...`);
        await sleep(delay);
      }
    }
  }

  return { success: false, error: `Failed after ${maxRetries} attempts` };
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

    const url = new URL(req.url);
    const forToday = url.searchParams.get("today") === "true";

    const targetDateObj = new Date();
    if (!forToday) {
      targetDateObj.setDate(targetDateObj.getDate() + 1);
    }
    const targetDate = targetDateObj.toISOString().split("T")[0];

    console.log(`[Scheduled] Generating challenges for ${targetDate} (forToday: ${forToday})`);

    const results: Record<string, { success: boolean; challenge_id?: string; error?: string }> = {};
    const failedCategories: Category[] = [];

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

      const result = await generateChallengeWithRetry(supabaseUrl, supabaseAnonKey, category, 3, 2000);
      results[category] = result;

      if (!result.success) {
        failedCategories.push(category);
      }

      await sleep(1000);
    }

    if (failedCategories.length > 0) {
      console.log(`[Scheduled] Retrying ${failedCategories.length} failed categories with longer delays...`);
      await sleep(5000);

      for (const category of failedCategories) {
        console.log(`[Scheduled] Final retry for ${category}...`);
        const result = await generateChallengeWithRetry(supabaseUrl, supabaseAnonKey, category, 2, 5000);
        results[category] = result;
        await sleep(2000);
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
