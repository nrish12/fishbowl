import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    console.log(`[Scheduled] Generating challenge for ${targetDate}`);

    const { data: existing } = await supabase
      .from("daily_challenges")
      .select("challenge_id")
      .eq("challenge_date", targetDate)
      .maybeSingle();

    if (existing) {
      console.log(`[Scheduled] Challenge for ${targetDate} already exists`);
      return new Response(
        JSON.stringify({
          success: true,
          message: `Challenge for ${targetDate} already exists`,
          date: targetDate,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Scheduled] Calling daily-challenge endpoint...`);
    const dailyChallengeUrl = `${supabaseUrl}/functions/v1/daily-challenge`;
    const response = await fetch(dailyChallengeUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate challenge: ${errorText}`);
    }

    const data = await response.json();
    console.log(`[Scheduled] Successfully generated challenge for ${targetDate}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Challenge generated for ${targetDate}`,
        date: targetDate,
        challenge_id: data.challenge_id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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