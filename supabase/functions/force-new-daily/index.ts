import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
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

    // Get recent subjects to avoid repetition
    const recentSubjects = await getRecentSubjects(supabase, 14);
    console.log(`Avoiding ${recentSubjects.length} recent subjects:`, recentSubjects);

    // Get existing daily challenge
    const { data: existing } = await supabase
      .from("daily_challenges")
      .select("challenge_id, challenges(target, type)")
      .eq("challenge_date", today)
      .maybeSingle();

    let previousTarget = null;
    if (existing) {
      const challenge = existing.challenges as any;
      previousTarget = challenge?.target;

      // Delete from daily_challenges
      await supabase
        .from("daily_challenges")
        .delete()
        .eq("challenge_date", today);

      // Delete the actual challenge
      await supabase
        .from("challenges")
        .delete()
        .eq("id", existing.challenge_id);
    }

    // Randomly pick type
    const types = ["person", "place", "thing"] as const;
    const type = types[Math.floor(Math.random() * types.length)];

    // Generate random subject using AI with exclusions
    let currentTarget = await generateRandomSubject(type, previousTarget, recentSubjects, openaiKey);

    // Try to create challenge
    const createUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/create-challenge-fast`;
    let challengeData = null;
    let attempts = 0;
    const maxAttempts = 3;

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
        console.log(`Attempt ${attempts} failed for ${currentTarget}:`, errorData);
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate challenge after ${maxAttempts} attempts: ${errorData.error || errorData.reason}`);
        }
        // Try a different target with exclusions
        currentTarget = await generateRandomSubject(type, currentTarget, recentSubjects, openaiKey);
      }
    }

    // Randomly choose difficulty
    const selectedPhase1Index = Math.floor(Math.random() * 3);
    const selectedPhase2Index = Math.floor(Math.random() * 3);

    const { data: newChallenge, error: challengeInsertError } = await supabase
      .from("challenges")
      .insert({
        id: challengeData.challenge_id,
        type: challengeData.type,
        target: challengeData.target,
        aliases: challengeData.aliases,
        fame_score: challengeData.fame_score,
        phase1: challengeData.phase1_options[selectedPhase1Index],
        phase2: challengeData.phase2_options[selectedPhase2Index],
        phase3: challengeData.phase3,
      })
      .select()
      .single();

    if (challengeInsertError) throw challengeInsertError;

    await supabase.from("daily_challenges").insert({
      challenge_id: newChallenge.id,
      challenge_date: today,
    });

    return new Response(
      JSON.stringify({
        success: true,
        challenge_id: newChallenge.id,
        type: newChallenge.type,
        target: newChallenge.target,
        date: today,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
