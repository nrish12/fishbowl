import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  "Access-Control-Max-Age": "86400",
};

interface FinalizeRequest {
  challenge_id: string;
  type: string;
  target: string;
  fame_score: number;
  phase1: string[];
  phase2: string;
  phase3: {
    geography: string;
    history: string;
    culture: string;
    stats: string;
    visual: string;
  };
  aliases: string[];
  session_id: string;
  preview_id?: string;
  selected_phase1_index: number;
  selected_phase2_index: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body: FinalizeRequest = await req.json();
    const {
      challenge_id,
      type,
      target,
      fame_score,
      phase1,
      phase2,
      phase3,
      aliases,
      session_id,
      preview_id,
      selected_phase1_index,
      selected_phase2_index
    } = body;

    if (!challenge_id || !type || !target || !phase1 || !phase2 || !phase3 || !aliases || !session_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 7 * 24 * 60 * 60;

    const payload = {
      ver: 1,
      id: challenge_id,
      type,
      target,
      aliases,
      hints: {
        phase1,
        phase2,
        phase3,
      },
      createdAt: now,
      exp: now + expiresIn,
    };

    const secret = Deno.env.get("CHALLENGE_SIGNING_SECRET");
    if (!secret) {
      throw new Error("JWT signing secret not configured");
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const header = { alg: "HS256", typ: "JWT" };

    // Use proper UTF-8 encoding instead of btoa for Unicode support
    const headerBytes = encoder.encode(JSON.stringify(header));
    const payloadBytes = encoder.encode(JSON.stringify(payload));

    const encodedHeader = btoa(String.fromCharCode(...headerBytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    const encodedPayload = btoa(String.fromCharCode(...payloadBytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    const signatureData = encoder.encode(`${encodedHeader}.${encodedPayload}`);
    const signature = await crypto.subtle.sign("HMAC", key, signatureData);
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    const token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabase.from("challenges").insert({
      id: challenge_id,
      type,
      target,
      fame_score,
      expires_at: new Date((now + expiresIn) * 1000).toISOString(),
      hints: payload.hints,
      aliases,
    });

    await supabase.from("challenge_metadata").insert({
      challenge_id,
      is_daily: false,
      creator_session_id: session_id,
      selected_phase1_index,
      selected_phase2_index,
    });

    if (preview_id) {
      await supabase
        .from("challenge_previews")
        .update({
          finalized: true,
          challenge_id,
          selected_phase1_index,
          selected_phase2_index,
        })
        .eq("id", preview_id);
    }

    return new Response(
      JSON.stringify({
        token,
        challenge_id,
        expires_at: new Date((now + expiresIn) * 1000).toISOString(),
      }),
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