import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://clueladder.com",
];

function getCorsHeaders(origin: string | null) {
  const corsHeaders = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { count: totalChallenges } = await supabase
      .from("challenges")
      .select("*", { count: "exact", head: true });

    const { count: dailyChallenges } = await supabase
      .from("daily_challenges")
      .select("*", { count: "exact", head: true });

    const { data: dailyByCategory } = await supabase
      .from("daily_challenges")
      .select("category")
      .not("category", "is", null);

    const categoryCounts = dailyByCategory?.reduce((acc: Record<string, number>, row: any) => {
      acc[row.category] = (acc[row.category] || 0) + 1;
      return acc;
    }, {}) || {};

    const today = new Date().toISOString().split("T")[0];
    const { data: todaysChallenges } = await supabase
      .from("daily_challenges")
      .select("category, difficulty, challenge_id, challenges(target, type)")
      .eq("challenge_date", today)
      .order("category");

    const { count: totalAttempts } = await supabase
      .from("challenge_attempts")
      .select("*", { count: "exact", head: true });

    const { data: qualityScores } = await supabase
      .from("challenge_quality_scores")
      .select("quality_score");

    const avgQuality = qualityScores && qualityScores.length > 0
      ? qualityScores.reduce((sum, s) => sum + s.quality_score, 0) / qualityScores.length
      : 0;

    const { data: recentChallenges } = await supabase
      .from("daily_challenges")
      .select(`
        challenge_date,
        category,
        difficulty,
        challenges (
          id,
          type,
          target,
          fame_score,
          created_at
        )
      `)
      .order("challenge_date", { ascending: false })
      .limit(20);

    const { data: difficultyStats } = await supabase
      .from("difficulty_performance")
      .select("*")
      .gte("total_attempts", 5)
      .order("completion_rate", { ascending: false })
      .limit(10);

    const formattedRecent = recentChallenges?.map((dc: any) => ({
      challenge_date: dc.challenge_date,
      category: dc.category,
      difficulty: dc.difficulty,
      id: dc.challenges?.id,
      type: dc.challenges?.type,
      target: dc.challenges?.target,
      fame_score: dc.challenges?.fame_score,
      created_at: dc.challenges?.created_at,
    })) || [];

    return new Response(
      JSON.stringify({
        total_challenges: totalChallenges || 0,
        daily_challenges: dailyChallenges || 0,
        daily_by_category: categoryCounts,
        todays_challenges: todaysChallenges || [],
        total_attempts: totalAttempts || 0,
        avg_quality_score: avgQuality,
        recent_challenges: formattedRecent,
        difficulty_stats: difficultyStats || [],
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
