import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

interface TrackEventRequest {
  event_type: "visit" | "attempt" | "completion" | "share";
  challenge_id: string;
  session_id: string;
  data?: any;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body: TrackEventRequest = await req.json();
    const { event_type, challenge_id, session_id, data } = body;

    if (!event_type || !challenge_id || !session_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let result;

    switch (event_type) {
      case "visit":
        result = await supabase
          .from("challenge_visitors")
          .insert({
            challenge_id,
            session_id,
            referrer: data?.referrer,
          })
          .select()
          .single();
        break;

      case "attempt":
        if (!data?.guess_text || data?.phase_revealed === undefined) {
          return new Response(
            JSON.stringify({ error: "Missing guess_text or phase_revealed" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await supabase
          .from("challenge_attempts")
          .insert({
            challenge_id,
            session_id,
            guess_text: data.guess_text,
            phase_revealed: data.phase_revealed,
            is_correct: data.is_correct || false,
          })
          .select()
          .single();
        break;

      case "completion":
        if (data?.completed_phase === undefined) {
          return new Response(
            JSON.stringify({ error: "Missing completed_phase" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await supabase
          .from("challenge_completions")
          .insert({
            challenge_id,
            session_id,
            completed_phase: data.completed_phase,
            total_attempts: data.total_attempts || 1,
            time_taken_seconds: data.time_taken_seconds,
          })
          .select()
          .single();
        break;

      case "share":
        result = await supabase
          .from("challenge_shares")
          .insert({
            challenge_id,
            sharer_session_id: session_id,
            share_method: data?.share_method || "clipboard",
          })
          .select()
          .single();
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid event_type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    if (result.error) {
      if (result.error.code === "23505") {
        return new Response(
          JSON.stringify({ success: true, message: "Already recorded" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw result.error;
    }

    return new Response(
      JSON.stringify({ success: true }),
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