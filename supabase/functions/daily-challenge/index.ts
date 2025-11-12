import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  "Access-Control-Max-Age": "86400",
};

async function getRecentSubjects(supabase: any, days: number = 14): Promise<string[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoff = cutoffDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_challenges")
    .select("challenges(target)")
    .gte("challenge_date", cutoff);

  if (error || !data) return [];

  return data
    .map((row: any) => row.challenges?.target)
    .filter((target: string | null) => target != null);
}

async function generateRandomSubject(
  type: string,
  previousTarget: string | null,
  recentSubjects: string[],
  openaiKey: string
): Promise<string> {
  const excludeList = [previousTarget, ...recentSubjects].filter(Boolean).join(", ");

  const prompt = `You are an AI picking a random famous ${type} for a daily guessing game. This is an AI-POWERED game where you bring creativity and variety to each day's challenge.

YOUR ROLE: Pick something that feels right for TODAY. Use your AI judgment to select subjects that are:

THE FAMILY FEUD STANDARD (Your Target Zone):
- Fame Level: 70-85% recognition among general public (FAMILY FEUD LEVEL!)
- NOT the most obvious #1 answers (Einstein, Eiffel Tower, Mona Lisa)
- NOT obscure or specialized knowledge (Hedy Lamarr, Yayoi Kusama, Great Wave off Kanagawa)
- JUST RIGHT: Would appear on Family Feud - recognizable but not #1 answer
- TEST: If you asked 100 random people, would 70+ know it? If no, reject it.

${excludeList ? `EXCLUSIONS - Do NOT pick any of these (used recently): ${excludeList}` : ''}

VARIETY PHILOSOPHY:
This is a DAILY game. Show your range! Don't default to "safe" picks.
- Rotate through different eras (ancient, medieval, modern, contemporary)
- Rotate through different regions (Europe, Asia, Americas, Africa, Middle East)
- Rotate through different fields (science, arts, politics, sports, culture)
- Make each day feel fresh and different

${type === 'person' ? `
PERSON EXAMPLES (use these as inspiration, not a limit):
Sweet Spot Range:
- Historical: Cleopatra, Genghis Khan, Queen Victoria, Joan of Arc, Frederick Douglass
- Scientists: Marie Curie, Nikola Tesla, Jane Goodall, Carl Sagan, Rachel Carson
- Artists: Frida Kahlo, Salvador Dali, Georgia O'Keeffe, Banksy, Bob Ross
- Writers: Maya Angelou, Edgar Allan Poe, J.K. Rowling, Dr. Seuss, Roald Dahl
- Musicians: Louis Armstrong, Jimi Hendrix, Ella Fitzgerald, David Bowie, Freddie Mercury
- Athletes: Jackie Robinson, Usain Bolt, Simone Biles, Bruce Lee, Tony Hawk
- Leaders: Dalai Lama, Malala Yousafzai, Cesar Chavez, Susan B. Anthony
- Entertainers: Charlie Chaplin, Lucille Ball, Robin Williams, Mr. Rogers, Betty White

TOO OBVIOUS (avoid these defaults): Einstein, Washington, Lincoln, Shakespeare, Jesus
TOO OBSCURE (avoid these): Obscure PhDs, niche artists, regional-only figures` : ''}

${type === 'place' ? `
PLACE EXAMPLES (use these as inspiration, not a limit):
Sweet Spot Range:
- Ancient Sites: Angkor Wat, Petra, Mesa Verde, Teotihuacan, Pompeii
- Natural Wonders: Victoria Falls, Giant's Causeway, Aurora Borealis, Dead Sea, Galapagos Islands
- Modern Landmarks: Space Needle, Gateway Arch, CN Tower, Burj Khalifa, Opera House
- Historic Sites: Alcatraz, Pearl Harbor, Berlin Wall, Gettysburg, Chernobyl
- Cultural: Hollywood Walk of Fame, Bourbon Street, Abbey Road, Times Square, Red Square
- Unique: Area 51, Loch Ness, Bermuda Triangle, Route 66, Silk Road

TOO OBVIOUS (avoid these defaults): Eiffel Tower, Statue of Liberty, Great Wall, Pyramids
TOO OBSCURE (avoid these): Regional parks, small monuments, local landmarks` : ''}

${type === 'thing' ? `
THING EXAMPLES (use these as inspiration, not a limit):
Sweet Spot Range:
- Inventions: Microwave, Post-it Notes, Velcro, Zipper, Safety Pin, Lightbulb, Telephone
- Cultural Icons: Barbie, Rubik's Cube, Slinky, Etch A Sketch, Smiley Face, Pac-Man, Frisbee
- Symbols: Peace Sign, Yin Yang, Recycling Symbol, Smiley Face, Heart Symbol, Dollar Sign
- Historic Objects: Liberty Bell, Hope Diamond, Rosetta Stone, Crown Jewels
- Modern Tech: USB Drive, QR Code, Hashtag, Bluetooth, WiFi, Emoji, Selfie Stick
- Everyday Objects: Paperclip, Stapler, Pencil, Scissors, Calculator, Stopwatch

WARNING ON ART: Avoid specific artwork titles unless MEGA famous (Mona Lisa, The Thinker, Statue of David level)
- DO NOT use: Specific paintings by name (Great Wave, American Gothic, The Scream, etc.)
- INSTEAD prefer: General categories or famous sculptures everyone knows

TOO OBVIOUS (avoid these defaults): Mona Lisa, iPhone, Coca-Cola, McDonald's Logo
TOO OBSCURE (avoid these): Specific art pieces, niche artifacts, regional items, insider references` : ''}

YOUR AI DECISION PROCESS:
1. Consider what day it is, what you've generated recently
2. Think about variety - balance eras, regions, fields
3. Pick something in the SWEET SPOT range
4. Avoid both extremes (too obvious AND too obscure)
5. Trust your AI judgment to select something interesting

CRITICAL: You are FREE to pick ANY subject in the sweet spot range. The examples above are inspiration, not limitations. Use your creativity!

Respond with ONLY a JSON object:
{
  "target": "the ${type} you've chosen"
}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI curator for a daily guessing game. Your superpower is finding the SWEET SPOT: subjects that are recognizable but not obvious. Avoid both extremes - no Einstein/Eiffel Tower defaults, but also no obscure academics. Think '60-75% of people would know this' - interesting enough to be engaging, known enough to be fair. Embrace your creativity and variety. Each day should feel fresh and different."
        },
        { role: "user", content: prompt }
      ],
      temperature: 1.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate random subject");
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  return result.target;
}

function base64UrlEncode(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

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
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
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

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OpenAI API key not configured");
    }

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
      const challenge = existing.challenges as any;
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

    // Get recent subjects to avoid repetition (last 14 days)
    const recentSubjects = await getRecentSubjects(supabase, 14);
    console.log(`Avoiding ${recentSubjects.length} recent subjects:`, recentSubjects);

    // Randomly pick type
    const types = ["person", "place", "thing"] as const;
    const type = types[Math.floor(Math.random() * types.length)];

    // Generate random subject using AI with exclusion list
    const target = await generateRandomSubject(type, null, recentSubjects, openaiKey);

    const createUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/create-challenge-fast`;
    let challengeData = null;
    let attempts = 0;
    const maxAttempts = 3;
    let currentTarget = target;

    while (!challengeData && attempts < maxAttempts) {
      attempts++;

      const createResponse = await fetch(createUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({ type, target: currentTarget }),
      });

      if (createResponse.ok) {
        challengeData = await createResponse.json();
        break;
      } else {
        const errorData = await createResponse.json();
        console.log(`Attempt ${attempts} failed for ${currentTarget}:`, errorData.error || errorData.reason);
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate challenge after ${maxAttempts} attempts: ${errorData.error || errorData.reason}`);
        }
        // Try a different target with exclusions
        currentTarget = await generateRandomSubject(type, currentTarget, recentSubjects, openaiKey);
      }
    }

    // Randomly select difficulty levels (0 = easier, 1 = medium, 2 = harder)
    const selectedPhase1Index = Math.floor(Math.random() * 3);
    const selectedPhase2Index = Math.floor(Math.random() * 3);

    const { data: newChallenge, error: challengeInsertError } = await supabase
      .from("challenges")
      .insert({
        id: challengeData.challenge_id,
        type: challengeData.type,
        target: challengeData.target,
        aliases: challengeData.aliases,
        hints: {
          phase1: challengeData.phase1_options[selectedPhase1Index],
          phase2: challengeData.phase2_options[selectedPhase2Index],
          phase3: challengeData.phase3,
        },
        fame_score: challengeData.fame_score,
      })
      .select()
      .single();

    if (challengeInsertError) {
      throw challengeInsertError;
    }

    const { error: dailyInsertError } = await supabase
      .from("daily_challenges")
      .insert({
        challenge_date: today,
        challenge_id: challengeData.challenge_id,
      });

    if (dailyInsertError) {
      throw dailyInsertError;
    }

    const token = await createToken(newChallenge);

    return new Response(
      JSON.stringify({
        challenge_id: challengeData.challenge_id,
        token,
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
