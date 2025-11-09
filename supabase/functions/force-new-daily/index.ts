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

  const prompt = `You are an AI picking a random famous ${type} for a daily guessing game. This is an AI-POWERED game where you bring creativity and variety to each day's challenge.

YOUR ROLE: Pick something that feels right for TODAY. Use your AI judgment to select subjects that are:

THE SWEET SPOT (Your Target Zone):
- Fame Level: 60-75% recognition among general public
- NOT the most obvious choices everyone picks (Einstein, Eiffel Tower, Mona Lisa)
- NOT too obscure (Hedy Lamarr, Yayoi Kusama, Great Wave off Kanagawa)
- JUST RIGHT: Interesting, recognizable, but makes players think

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
- Art: The Scream, American Gothic, The Thinker, Venus de Milo, Nighthawks
- Inventions: Microwave, Post-it Notes, Velcro, Zipper, Safety Pin, Lightbulb
- Cultural Icons: Barbie, Rubik's Cube, Slinky, Etch A Sketch, Smiley Face, Pac-Man
- Symbols: Peace Sign, Yin Yang, Recycling Symbol, Caduceus, Ampersand
- Historic Objects: Liberty Bell, Hope Diamond, Rosetta Stone, Magna Carta
- Modern Tech: USB Drive, QR Code, Hashtag, Bluetooth, WiFi, Emoji

TOO OBVIOUS (avoid these defaults): Mona Lisa, iPhone, Coca-Cola, McDonald's Logo
TOO OBSCURE (avoid these): Niche artifacts, regional items, insider references` : ''}

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
