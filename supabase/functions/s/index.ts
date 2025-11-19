import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const shortCode = url.searchParams.get("c");

    if (!shortCode) {
      return new Response(
        JSON.stringify({ error: "Short code 'c' parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up short URL
    const { data, error } = await supabase
      .from("short_urls")
      .select("full_token, challenge_id")
      .eq("short_code", shortCode)
      .maybeSingle();

    if (error || !data) {
      return new Response(
        JSON.stringify({ error: "Short URL not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update click count and last accessed
    await supabase
      .from("short_urls")
      .update({
        clicks: supabase.rpc('increment', { row_id: shortCode }),
        last_accessed: new Date().toISOString(),
      })
      .eq("short_code", shortCode);

    // Return the full token
    return new Response(
      JSON.stringify({ 
        token: data.full_token,
        challenge_id: data.challenge_id 
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300"
        } 
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});