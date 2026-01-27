import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://mystle.app",
  "https://www.mystle.app",
  "https://fishbowl-roan.vercel.app",
];

function getCorsHeaders(origin: string | null) {
  const corsHeaders = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (origin && allowedOrigins.includes(origin)) {
    return { ...corsHeaders, "Access-Control-Allow-Origin": origin };
  }
  return { ...corsHeaders, "Access-Control-Allow-Origin": allowedOrigins[0] };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { type, fame_score } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: perfData } = await supabase
      .from("difficulty_performance")
      .select("*")
      .eq("challenge_type", type)
      .gte("fame_score", Math.max(0, fame_score - 1))
      .lte("fame_score", Math.min(5, fame_score + 1))
      .gte("total_attempts", 10)
      .order("completion_rate", { ascending: false })
      .limit(20);

    if (!perfData || perfData.length === 0) {
      // Randomly choose difficulty, with slight bias towards medium/hard
      const random1 = Math.random();
      const random2 = Math.random();
      const phase1Difficulty = random1 < 0.2 ? 0 : random1 < 0.6 ? 1 : 2; // 20% easy, 40% medium, 40% hard
      const phase2Difficulty = random2 < 0.2 ? 0 : random2 < 0.6 ? 1 : 2;

      return new Response(
        JSON.stringify({
          recommended_phase1_index: phase1Difficulty,
          recommended_phase2_index: phase2Difficulty,
          confidence_score: 0.3,
          reasoning: "Using varied difficulty with medium-hard bias (no historical data yet)",
          data_points: 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const TARGET_COMPLETION_RATE = 0.5;
    const TARGET_SOLVE_TIME = 120;

    const scored = perfData.map((perf) => {
      const completionScore = 1 - Math.abs((perf.completion_rate || 0.5) - TARGET_COMPLETION_RATE);

      const timeScore = perf.avg_solve_time_seconds
        ? 1 - Math.min(1, Math.abs(perf.avg_solve_time_seconds - TARGET_SOLVE_TIME) / TARGET_SOLVE_TIME)
        : 0.5;

      const total = perf.gold_completions + perf.silver_completions + perf.bronze_completions;
      const silverRatio = total > 0 ? perf.silver_completions / total : 0;
      const balanceScore = 1 - Math.abs(silverRatio - 0.6);

      // Slight bias towards medium+ difficulty for more engaging gameplay
      const difficultyBonus = (perf.selected_phase1_index >= 1 && perf.selected_phase2_index >= 1) ? 0.1 : 0;

      const finalScore = (completionScore * 0.5) + (timeScore * 0.3) + (balanceScore * 0.2) + difficultyBonus;

      return {
        ...perf,
        score: finalScore,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const optimal = scored[0];

    const confidence = Math.min(0.95, 0.5 + (optimal.total_attempts / 200));
    const total = optimal.gold_completions + optimal.silver_completions + optimal.bronze_completions;

    return new Response(
      JSON.stringify({
        recommended_phase1_index: optimal.selected_phase1_index,
        recommended_phase2_index: optimal.selected_phase2_index,
        confidence_score: confidence,
        reasoning: `Based on ${optimal.total_attempts} attempts with ${(optimal.completion_rate * 100).toFixed(1)}% completion rate and ${Math.round(optimal.avg_solve_time_seconds)}s avg solve time`,
        data_points: optimal.total_attempts,
        performance_metrics: {
          completion_rate: optimal.completion_rate,
          avg_solve_time: optimal.avg_solve_time_seconds,
          gold_rate: total > 0 ? (optimal.gold_completions / total) : 0,
          silver_rate: total > 0 ? (optimal.silver_completions / total) : 0,
          bronze_rate: total > 0 ? (optimal.bronze_completions / total) : 0,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});