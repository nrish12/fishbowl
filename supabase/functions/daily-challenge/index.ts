import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  "Access-Control-Max-Age": "86400",
};

const FAMOUS_SUBJECTS = {
  person: [
    "Albert Einstein", "Leonardo da Vinci", "Marie Curie", "William Shakespeare",
    "Cleopatra", "Napoleon Bonaparte", "Nelson Mandela", "Martin Luther King Jr.",
    "Frida Kahlo", "Pablo Picasso", "Mozart", "Beethoven", "Elvis Presley",
    "Michael Jordan", "Muhammad Ali", "Serena Williams", "Oprah Winfrey",
    "Steve Jobs", "Bill Gates", "Elon Musk", "Barack Obama", "Queen Elizabeth II"
  ],
  place: [
    "Eiffel Tower", "Great Wall of China", "Taj Mahal", "Grand Canyon",
    "Mount Everest", "Statue of Liberty", "Colosseum", "Machu Picchu",
    "Pyramids of Giza", "Stonehenge", "Niagara Falls", "Amazon Rainforest",
    "Sahara Desert", "Great Barrier Reef", "Antarctica", "Yellowstone",
    "Venice", "Tokyo", "Paris", "New York City", "London", "Sydney Opera House"
  ],
  thing: [
    "Mona Lisa", "iPhone", "Coca-Cola", "Tesla", "Nike shoes", "Lego",
    "Harry Potter books", "Star Wars", "Bitcoin", "Internet", "Wheel",
    "Light bulb", "Airplane", "Telescope", "Microscope", "Bicycle",
    "Piano", "Guitar", "Camera", "Television", "Smartphone", "Computer"
  ]
};

async function createToken(challenge: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 7 * 24 * 60 * 60;

  const payload = {
    ver: 1,
    id: challenge.id,
    type: challenge.type,
    target: challenge.target,
    aliases: challenge.aliases || [challenge.target],
    hints: challenge.hints || {},
    createdAt: Math.floor(new Date(challenge.created_at).getTime() / 1000),
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
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "");
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, "");
  const signatureData = encoder.encode(`${encodedHeader}.${encodedPayload}`);
  const signature = await crypto.subtle.sign("HMAC", key, signatureData);
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

Deno.serve(async (req: Request) => {

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const today = new Date().toISOString().split("T")[0];

    const { data: existing, error: fetchError } = await supabase
      .from("daily_challenges")
      .select("challenge_id, challenges(*)")
      .eq("challenge_date", today)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existing && existing.challenges) {
      const challenge = existing.challenges;
      const token = await createToken(challenge);

      return new Response(
        JSON.stringify({
          challenge_id: challenge.id,
          token,
          date: today,
          type: challenge.type,
          message: "Daily challenge retrieved"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const types = ["person", "place", "thing"] as const;
    const typeIndex = new Date().getDate() % 3;
    const type = types[typeIndex];
    const subjects = FAMOUS_SUBJECTS[type];
    const subjectIndex = Math.floor(Math.random() * subjects.length);
    const target = subjects[subjectIndex];

    const validateUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/validate-challenge`;
    const validateResponse = await fetch(validateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify({ type, target }),
    });

    if (!validateResponse.ok) {
      const errorData = await validateResponse.json();
      throw new Error(`Failed to generate challenge: ${errorData.error || errorData.reason || 'Unknown error'}`);
    }

    const challengeData = await validateResponse.json();

    const { error: insertError } = await supabase
      .from("daily_challenges")
      .insert({
        challenge_date: today,
        challenge_id: challengeData.challenge_id,
      });

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        challenge_id: challengeData.challenge_id,
        token: challengeData.token,
        date: today,
        type,
        message: "New daily challenge generated"
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
