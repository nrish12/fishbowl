import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://clueladder.com",
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
    const { challenge_id, completed_phase, solve_time_seconds, total_attempts } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: metadata } = await supabase
      .from("challenge_metadata")
      .select("*")
      .eq("challenge_id", challenge_id)
      .maybeSingle();

    if (!metadata) {
      return new Response(
        JSON.stringify({ error: "Challenge not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: challenge } = await supabase
      .from("challenges")
      .select("type, fame_score")
      .eq("id", challenge_id)
      .maybeSingle();

    if (!challenge) {
      return new Response(
        JSON.stringify({ error: "Challenge data not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase.rpc("update_difficulty_performance", {
      p_challenge_type: challenge.type,
      p_fame_score: challenge.fame_score,
      p_phase1_index: metadata.selected_phase1_index,
      p_phase2_index: metadata.selected_phase2_index,
      p_completed_phase: completed_phase,
      p_solve_time_seconds: solve_time_seconds,
      p_total_attempts: total_attempts,
    });

    return new Response(
      JSON.stringify({ success: true }),
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
