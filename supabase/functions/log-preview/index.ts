import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LogPreviewRequest {
  type: string;
  target_input: string;
  generated_phase1_options: string[][];
  generated_phase2_options: string[];
  generated_phase3: any;
  generated_aliases: string[];
  session_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: LogPreviewRequest = await req.json();

    if (!body.type || !body.target_input || !body.session_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabase
      .from("challenge_previews")
      .insert({
        type: body.type,
        target_input: body.target_input,
        generated_phase1_options: body.generated_phase1_options,
        generated_phase2_options: body.generated_phase2_options,
        generated_phase3: body.generated_phase3,
        generated_aliases: body.generated_aliases,
        session_id: body.session_id,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ preview_id: data.id }),
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