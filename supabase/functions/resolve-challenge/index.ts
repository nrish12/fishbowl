import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const tokenParam = url.searchParams.get("t");

    if (!tokenParam) {
      return new Response(
        JSON.stringify({ error: "Token parameter 't' is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify JWT signature
    const secret = Deno.env.get("CHALLENGE_SIGNING_SECRET");
    if (!secret) {
      throw new Error("JWT signing secret not configured");
    }

    // Decode URL-encoded token if necessary
    let token = tokenParam;
    try {
      // Handle potential URL encoding issues from messaging apps
      token = decodeURIComponent(tokenParam);
    } catch {
      // If decoding fails, use original token
      token = tokenParam;
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      return new Response(
        JSON.stringify({ error: "Invalid token format" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    // Verify signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureData = encoder.encode(`${encodedHeader}.${encodedPayload}`);

    let signature: Uint8Array;
    try {
      const sigBase64 = encodedSignature.replace(/-/g, "+").replace(/_/g, "/");
      const sigPadded = sigBase64.padEnd(sigBase64.length + (4 - sigBase64.length % 4) % 4, "=");
      signature = Uint8Array.from(atob(sigPadded), (c) => c.charCodeAt(0));
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Failed to decode signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isValid = await crypto.subtle.verify("HMAC", key, signature, signatureData);

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid token signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let payload: any;
    try {
      const payloadBase64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
      const payloadPadded = payloadBase64.padEnd(payloadBase64.length + (4 - payloadBase64.length % 4) % 4, "=");
      const payloadJson = atob(payloadPadded);
      payload = JSON.parse(payloadJson);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Failed to decode token payload" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return new Response(
        JSON.stringify({ error: "Token has expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return hints without the target answer
    return new Response(
      JSON.stringify({
        id: payload.id,
        type: payload.type,
        hints: payload.hints,
        version: payload.ver,
        expires_at: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
        is_daily: payload.isDaily || false,
        category: payload.category || null,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
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