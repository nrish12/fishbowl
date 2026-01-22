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

THE FAMILY FEUD STANDARD (Your Target Zone):
- Fame Level: 70-85% recognition among general public (FAMILY FEUD LEVEL!)
- NOT the most obvious #1 answers (Einstein, Eiffel Tower, Mona Lisa)
- NOT obscure or specialized knowledge (Hedy Lamarr, Yayoi Kusama, Billie Holiday, Great Wave off Kanagawa)
- JUST RIGHT: Would appear on Family Feud - recognizable but not #1 answer
- TEST: If you asked 100 random people at a shopping mall, would 70+ know it? If no, REJECT IT.
- CRITICAL: If it's an art piece, historical figure, or cultural reference that only educated/art enthusiasts would know - REJECT IT!

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
- Scientists: Marie Curie, Nikola Tesla, Jane Goodall, Carl Sagan, Stephen Hawking
- Artists: Frida Kahlo, Salvador Dali, Pablo Picasso, Vincent van Gogh, Bob Ross
- Writers: Maya Angelou, Edgar Allan Poe, J.K. Rowling, Dr. Seuss, Roald Dahl
- Musicians: Elvis Presley, Michael Jackson, Madonna, Beyoncé, Johnny Cash, Aretha Franklin
- Athletes: Jackie Robinson, Usain Bolt, Simone Biles, Muhammad Ali, Serena Williams
- Leaders: Dalai Lama, Malala Yousafzai, Nelson Mandela, Susan B. Anthony, Martin Luther King Jr
- Entertainers: Charlie Chaplin, Lucille Ball, Robin Williams, Mr. Rogers, Betty White, Oprah Winfrey

TOO OBVIOUS (avoid these defaults): Einstein, Washington, Lincoln, Shakespeare, Jesus
TOO OBSCURE (avoid these - NEVER use): Billie Holiday, Hedy Lamarr, Yayoi Kusama, Rachel Carson, Cesar Chavez, any jazz musicians, any artists known only to art students, any historical figures known only to history majors` : ''}

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
- NEVER USE: The Great Wave off Kanagawa, American Gothic, The Scream, Starry Night, any specific painting
- NEVER USE: Jazz-era cultural items, specific art movements, niche historical artifacts
- INSTEAD prefer: Famous inventions, everyday objects, well-known symbols, modern tech everyone uses

TOO OBVIOUS (avoid these defaults): Mona Lisa, iPhone, Coca-Cola, McDonald's Logo
TOO OBSCURE (avoid these - NEVER use): The Great Wave off Kanagawa, any specific paintings/artwork, art movement references, niche artifacts, regional items, insider references, anything requiring art/history education to know` : ''}

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
      model: "gpt-5.1-chat-latest",
      messages: [
        {
          role: "system",
          content: "You are an AI curator for a daily guessing game that MUST follow the FAMILY FEUD standard. Your job is to pick subjects that 70-85% of random people at a shopping mall would know. NO art pieces, NO jazz musicians, NO historical figures requiring education to know. Think: Would my grandmother know this? Would a teenager know this? If not, REJECT IT. You MUST stay in the mainstream recognition zone - no niche knowledge allowed."
        },
        { role: "user", content: prompt }
      ],
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

    const url = new URL(req.url);
    const categoryParam = url.searchParams.get("category");
    const validCategories = ["pop_culture", "history_science", "sports", "geography"];

    if (!categoryParam || !validCategories.includes(categoryParam)) {
      return new Response(
        JSON.stringify({
          error: "Invalid or missing category parameter",
          valid_categories: validCategories
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const category = categoryParam;
    const today = new Date().toISOString().split("T")[0];

    // Get recent subjects to avoid repetition
    const recentSubjects = await getRecentSubjects(supabase, 14);
    console.log(`[${category}] Avoiding ${recentSubjects.length} recent subjects:`, recentSubjects);

    // Get existing daily challenge for this category
    const { data: existing } = await supabase
      .from("daily_challenges")
      .select("challenge_id, challenges(target, type)")
      .eq("challenge_date", today)
      .eq("category", category)
      .maybeSingle();

    let previousTarget = null;
    if (existing) {
      const challenge = existing.challenges as any;
      previousTarget = challenge?.target;
      console.log(`[${category}] Deleting existing challenge: ${previousTarget}`);

      // Delete from daily_challenges (only this category)
      await supabase
        .from("daily_challenges")
        .delete()
        .eq("challenge_date", today)
        .eq("category", category);

      // Delete the actual challenge
      await supabase
        .from("challenges")
        .delete()
        .eq("id", existing.challenge_id);
    }

    // Pick type based on category
    const categoryTypes: Record<string, string[]> = {
      pop_culture: ["person", "thing", "place"],
      history_science: ["person", "thing", "place"],
      sports: ["person", "place", "thing"],
      geography: ["place", "thing", "person"],
    };
    const types = categoryTypes[category] || ["person", "place", "thing"];
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
    const difficulties = ["easy", "medium", "hard"] as const;
    const difficultyWeights = [0.25, 0.50, 0.25];
    let random = Math.random();
    let cumulative = 0;
    let difficulty = "medium";
    for (let i = 0; i < difficulties.length; i++) {
      cumulative += difficultyWeights[i];
      if (random < cumulative) {
        difficulty = difficulties[i];
        break;
      }
    }

    const selectedPhase1Index = difficulties.indexOf(difficulty as any);
    const selectedPhase2Index = difficulties.indexOf(difficulty as any);

    const { data: newChallenge, error: challengeInsertError } = await supabase
      .from("challenges")
      .insert({
        id: challengeData.challenge_id,
        type: challengeData.type,
        target: challengeData.target,
        aliases: challengeData.aliases,
        fame_score: challengeData.fame_score,
        hints: {
          phase1: challengeData.phase1_options[selectedPhase1Index],
          phase2: challengeData.phase2_options[selectedPhase2Index],
          phase3: challengeData.phase3,
        },
      })
      .select()
      .single();

    if (challengeInsertError) throw challengeInsertError;

    await supabase.from("daily_challenges").insert({
      challenge_id: newChallenge.id,
      challenge_date: today,
      category,
      difficulty,
    });

    return new Response(
      JSON.stringify({
        success: true,
        challenge_id: newChallenge.id,
        type: newChallenge.type,
        target: newChallenge.target,
        category,
        difficulty,
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