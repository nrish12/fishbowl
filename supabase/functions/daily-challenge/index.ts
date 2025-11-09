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

  const prompt = `Generate a random famous ${type} for a mainstream guessing game played by average adults.

CRITICAL - TRUE RANDOMNESS REQUIRED:
- Must be recognizable to the GENERAL PUBLIC (60-70% of random Americans would know it)
- Think "Family Feud" or "Trivial Pursuit" level recognition
- This is for a DAILY challenge - variety is KEY, avoid repeating the same subjects
${excludeList ? `- DO NOT suggest any of these (used recently): ${excludeList}` : ''}

VARIETY IS ESSENTIAL - Rotate Through ALL Options:
Players see a new challenge daily. Don't default to the same "safe" choices repeatedly.

Your selection process:
1. Think of 7-10 different options in this category
2. Consider different eras, regions, and fields
3. Pick one that provides good variety
4. Avoid the most overused trivia answers

${type === 'person' ? `
Comprehensive variety pool (rotate between ALL of these):
- Ancient Leaders: Cleopatra, Julius Caesar, Alexander the Great, Tutankhamun
- Renaissance: Leonardo da Vinci, Michelangelo, Galileo, Copernicus
- Scientists: Marie Curie, Isaac Newton, Charles Darwin, Nikola Tesla, Thomas Edison, Alexander Graham Bell, Albert Einstein, Stephen Hawking
- US Presidents: George Washington, Abraham Lincoln, Theodore Roosevelt, Franklin D. Roosevelt, John F. Kennedy, Thomas Jefferson
- World Leaders: Winston Churchill, Napoleon Bonaparte, Queen Elizabeth I, Queen Victoria, Catherine the Great
- Civil Rights: Martin Luther King Jr., Rosa Parks, Harriet Tubman, Gandhi, Nelson Mandela, Malcolm X
- Artists: Vincent van Gogh, Pablo Picasso, Frida Kahlo, Rembrandt, Monet, Andy Warhol
- Modern Icons: Muhammad Ali, Oprah Winfrey, Michael Jackson, Elvis Presley, Walt Disney, Steve Jobs, Princess Diana
- Religious: Jesus Christ, Moses, Buddha, Muhammad, Confucius
- Writers: Shakespeare, Mark Twain, Jane Austen, Ernest Hemingway, Charles Dickens, Maya Angelou
- Explorers: Christopher Columbus, Marco Polo, Amelia Earhart, Ferdinand Magellan
- Musicians: Beethoven, Mozart, Bach, Louis Armstrong, Bob Marley
- Athletes: Babe Ruth, Michael Jordan, Serena Williams, Pele, Jesse Owens

Pick from the FULL pool - rotate eras and fields!` : ''}
${type === 'place' ? `
Comprehensive variety pool (rotate between ALL of these):
- European Icons: Eiffel Tower, Big Ben, Colosseum, Stonehenge, Leaning Tower of Pisa, Parthenon, Notre Dame, Arc de Triomphe
- Asian Landmarks: Taj Mahal, Great Wall of China, Forbidden City, Angkor Wat, Mount Fuji, Petra
- Americas: Statue of Liberty, Golden Gate Bridge, Mount Rushmore, Hollywood Sign, Christ the Redeemer, Chichen Itza
- Natural Wonders: Grand Canyon, Mount Everest, Niagara Falls, Great Barrier Reef, Victoria Falls, Amazon Rainforest, Yellowstone, Sahara Desert
- Ancient Sites: Pyramids of Giza, Machu Picchu, Roman Forum, Acropolis, Stonehenge, Easter Island
- Modern: Sydney Opera House, Burj Khalifa, Space Needle, CN Tower, Gateway Arch
- Religious: Vatican City, Mecca, Jerusalem, Varanasi

Pick from the FULL pool - rotate continents and types!` : ''}
${type === 'thing' ? `
Comprehensive variety pool (rotate between ALL of these):
- Classic Art: Mona Lisa, Statue of David, The Last Supper, The Thinker, The Scream, Starry Night, Girl with a Pearl Earring
- Brands: Coca-Cola, Nike Swoosh, McDonald's Golden Arches, Disney, Apple logo, Lego, Starbucks, Adidas
- Sports Icons: Olympic Rings, Super Bowl Trophy, World Cup, Stanley Cup, Wimbledon Trophy, NBA Championship Trophy
- Icons: Liberty Bell, Hollywood Sign, Oscar Statuette, Grammy, Emmy, Nobel Prize
- Historical: Declaration of Independence, US Constitution, Rosetta Stone, Dead Sea Scrolls, Magna Carta, Bill of Rights
- Inventions: Light Bulb, Telephone, Television, Airplane, Automobile, Printing Press, Internet, Wheel, Steam Engine
- Modern Tech: iPhone, Computer, Laptop, Bitcoin, GPS, Wi-Fi
- Cultural: Monopoly, Rubik's Cube, Barbie, Pac-Man, Guitar, Piano

Pick from the FULL pool - rotate categories and eras!` : ''}

IMPORTANT: TRUE variety means using the ENTIRE pool, not just favorites. Rotate broadly!

Respond with ONLY a JSON object:
{
  "target": "the famous ${type} name"
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
