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

    const { data: dailyChallenges } = await supabase
      .from("daily_challenges")
      .select(`
        challenge_date,
        challenge_id,
        challenges (
          id,
          type,
          target,
          fame_score
        )
      `)
      .order("challenge_date", { ascending: false })
      .limit(30);

    const formatted = (dailyChallenges || []).map((dc: any) => ({
      challenge_date: dc.challenge_date,
      challenge_id: dc.challenge_id,
      type: dc.challenges?.type,
      target: dc.challenges?.target,
      fame_score: dc.challenges?.fame_score,
    }));

    return new Response(
      JSON.stringify({ challenges: formatted }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
