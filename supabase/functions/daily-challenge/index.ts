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

  const prompt = `You are picking a random famous ${type} for a mainstream guessing game.

CRITICAL INSTRUCTION - ONLY PICK FROM THE LIST BELOW:
You MUST select ONE subject from the list provided. Do NOT create new subjects.
The list contains 60-80 mainstream subjects that average Americans would recognize.

${excludeList ? `EXCLUSIONS - Do NOT pick any of these (used recently): ${excludeList}` : ''}

${type === 'person' ? `
SELECT ONE from this COMPLETE LIST (no other options allowed):
- Cleopatra
- Julius Caesar
- Alexander the Great
- Tutankhamun
- Leonardo da Vinci
- Michelangelo
- Galileo
- Copernicus
- Marie Curie
- Isaac Newton
- Charles Darwin
- Nikola Tesla
- Thomas Edison
- Alexander Graham Bell
- Albert Einstein
- Stephen Hawking
- George Washington
- Abraham Lincoln
- Theodore Roosevelt
- Franklin D. Roosevelt
- John F. Kennedy
- Thomas Jefferson
- Winston Churchill
- Napoleon Bonaparte
- Queen Elizabeth I
- Queen Victoria
- Catherine the Great
- Martin Luther King Jr.
- Rosa Parks
- Harriet Tubman
- Gandhi
- Nelson Mandela
- Malcolm X
- Vincent van Gogh
- Pablo Picasso
- Frida Kahlo
- Rembrandt
- Monet
- Andy Warhol
- Muhammad Ali
- Oprah Winfrey
- Michael Jackson
- Elvis Presley
- Walt Disney
- Steve Jobs
- Princess Diana
- Jesus Christ
- Moses
- Buddha
- Muhammad
- Confucius
- Shakespeare
- Mark Twain
- Jane Austen
- Ernest Hemingway
- Charles Dickens
- Maya Angelou
- Christopher Columbus
- Marco Polo
- Amelia Earhart
- Ferdinand Magellan
- Beethoven
- Mozart
- Bach
- Louis Armstrong
- Bob Marley
- Babe Ruth
- Michael Jordan
- Serena Williams
- Pele
- Jesse Owens
- Marilyn Monroe
- Albert Schweitzer
- Helen Keller
- Anne Frank` : ''}
${type === 'place' ? `
SELECT ONE from this COMPLETE LIST (no other options allowed):
- Eiffel Tower
- Big Ben
- Colosseum
- Stonehenge
- Leaning Tower of Pisa
- Parthenon
- Notre Dame
- Arc de Triomphe
- Taj Mahal
- Great Wall of China
- Forbidden City
- Angkor Wat
- Mount Fuji
- Petra
- Statue of Liberty
- Golden Gate Bridge
- Mount Rushmore
- Hollywood Sign
- Christ the Redeemer
- Chichen Itza
- Grand Canyon
- Mount Everest
- Niagara Falls
- Great Barrier Reef
- Victoria Falls
- Amazon Rainforest
- Yellowstone
- Sahara Desert
- Pyramids of Giza
- Machu Picchu
- Roman Forum
- Acropolis
- Easter Island
- Sydney Opera House
- Burj Khalifa
- Space Needle
- CN Tower
- Gateway Arch
- Vatican City
- Mecca
- Jerusalem
- Varanasi
- Buckingham Palace
- White House
- Times Square
- Central Park
- Disneyland
- Niagara Falls
- Yosemite
- Rocky Mountains` : ''}
${type === 'thing' ? `
SELECT ONE from this COMPLETE LIST (no other options allowed):
- Mona Lisa
- Statue of David
- The Last Supper
- The Thinker
- The Scream
- Starry Night
- Girl with a Pearl Earring
- Coca-Cola
- Nike Swoosh
- McDonald's Golden Arches
- Disney
- Apple Logo
- Lego
- Starbucks
- Adidas
- Olympic Rings
- Super Bowl Trophy
- World Cup
- Stanley Cup
- Wimbledon Trophy
- NBA Championship Trophy
- Liberty Bell
- Hollywood Sign
- Oscar Statuette
- Grammy
- Emmy
- Nobel Prize
- Declaration of Independence
- US Constitution
- Rosetta Stone
- Dead Sea Scrolls
- Magna Carta
- Bill of Rights
- Light Bulb
- Telephone
- Television
- Airplane
- Automobile
- Printing Press
- Internet
- Wheel
- Steam Engine
- iPhone
- Computer
- Laptop
- Bitcoin
- GPS
- Wi-Fi
- Monopoly
- Rubik's Cube
- Barbie
- Pac-Man
- Guitar
- Piano
- American Flag
- Bicycle
- Camera` : ''}

SELECTION PROCESS:
1. Remove any excluded subjects from your consideration
2. Pick a RANDOM subject from the remaining options
3. Ensure variety - don't favor any particular category
4. Return EXACTLY as it appears in the list above

Respond with ONLY a JSON object:
{
  "target": "exact name from list"
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
          content: "You are selecting subjects for a DAILY guessing game with TRUE RANDOMNESS. Your goal is maximum variety - don't default to safe choices. Consider 7-10 options from across different eras, regions, and categories, then pick one that provides good variety. The entire pool should be used equally over time. Think variety, not just fame."
        },
        { role: "user", content: prompt }
      ],
      temperature: 1.0,
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
