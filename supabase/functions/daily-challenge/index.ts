import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getClientIdentifier } from "../_shared/rateLimit.ts";

type DailyCategory = "pop_culture" | "history_science" | "sports" | "geography";
type Difficulty = "easy" | "medium" | "hard";

const VALID_CATEGORIES: DailyCategory[] = ["pop_culture", "history_science", "sports", "geography"];
const VALID_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const DIFFICULTY_TO_INDEX: Record<Difficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

interface CategoryConfig {
  name: string;
  types: ("person" | "place" | "thing")[];
  typeWeights: number[];
  subjectPrompt: string;
  systemPrompt: string;
}

const FALLBACK_SUBJECTS: Record<DailyCategory, { person: string[]; place: string[]; thing: string[] }> = {
  pop_culture: {
    person: ["Tom Hanks", "Taylor Swift", "Oprah Winfrey", "Will Smith", "Beyonce", "Leonardo DiCaprio", "Jennifer Aniston", "Dwayne Johnson"],
    place: ["Hollywood Sign", "Broadway", "Graceland", "Abbey Road", "Las Vegas Strip", "Disney World"],
    thing: ["Star Wars", "The Simpsons", "Netflix", "iPhone", "Harry Potter", "Marvel Cinematic Universe", "Game of Thrones"]
  },
  history_science: {
    person: ["Marie Curie", "Leonardo da Vinci", "Cleopatra", "Neil Armstrong", "Benjamin Franklin", "Albert Einstein", "Galileo Galilei", "Isaac Newton"],
    place: ["Pompeii", "The Colosseum", "Machu Picchu", "Stonehenge", "The Pyramids of Giza", "The Great Wall of China"],
    thing: ["The Printing Press", "Penicillin", "The Lightbulb", "DNA", "The Telescope", "The Compass", "The Wheel"]
  },
  sports: {
    person: ["Michael Jordan", "Serena Williams", "Muhammad Ali", "Babe Ruth", "Pele", "Tiger Woods", "Tom Brady", "Usain Bolt"],
    place: ["Madison Square Garden", "Wembley Stadium", "Augusta National", "Wimbledon", "Yankee Stadium", "The Olympic Stadium"],
    thing: ["The Super Bowl", "The Olympics", "FIFA World Cup", "The Stanley Cup", "March Madness", "The Kentucky Derby"]
  },
  geography: {
    person: ["Marco Polo", "Christopher Columbus", "Amelia Earhart", "Ferdinand Magellan", "Lewis and Clark", "Jacques Cousteau"],
    place: ["The Amazon Rainforest", "Mount Everest", "The Grand Canyon", "The Great Barrier Reef", "Niagara Falls", "The Sahara Desert"],
    thing: ["The Northern Lights", "The Mississippi River", "The Alps", "Route 66", "The Panama Canal", "The Nile River"]
  }
};

const CATEGORY_CONFIGS: Record<DailyCategory, CategoryConfig> = {
  pop_culture: {
    name: "Pop Culture",
    types: ["person", "thing", "place"],
    typeWeights: [0.34, 0.33, 0.33],
    subjectPrompt: `You are picking a famous POP CULTURE subject for a daily guessing game.

FOCUS AREAS:
- Celebrities (actors, musicians, TV personalities, influencers)
- Movies and TV shows (iconic films, hit series, franchises)
- Music (famous songs, albums, bands, musical phenomena)
- Viral moments and internet culture
- Entertainment industry icons

EXAMPLES OF GOOD PICKS:
- People: Tom Hanks, Taylor Swift, Oprah Winfrey, The Rock, Will Smith, Beyonce, Keanu Reeves
- Things: Star Wars, The Simpsons, Friends (TV show), TikTok, Netflix, Harry Potter, Marvel Cinematic Universe
- Places: Hollywood Sign, Broadway, Graceland, Abbey Road

AVOID:
- Obscure indie artists or underground culture
- Reality TV stars with short fame spans
- Highly controversial recent events`,
    systemPrompt: "You pick mainstream pop culture subjects that anyone who watches TV, movies, or follows entertainment would recognize. Think household names and cultural phenomena that cross generations."
  },
  history_science: {
    name: "History & Science",
    types: ["person", "thing", "place"],
    typeWeights: [0.34, 0.33, 0.33],
    subjectPrompt: `You are picking a famous HISTORY or SCIENCE subject for a daily guessing game.

FOCUS AREAS:
- Historical figures (leaders, explorers, revolutionaries)
- Scientists and inventors
- Major inventions and discoveries
- Historical events and eras
- Scientific concepts everyone learns in school

EXAMPLES OF GOOD PICKS:
- People: Marie Curie, Leonardo da Vinci, Cleopatra, Neil Armstrong, Benjamin Franklin, Rosa Parks
- Things: The Printing Press, Penicillin, The Lightbulb, DNA, The Internet, Telescope
- Places: Pompeii, The Colosseum, Machu Picchu, The Titanic (wreck site), Pearl Harbor

CRITICAL RULES:
- Pick subjects taught in HIGH SCHOOL, not graduate-level history
- Everyone should have heard of them at least once
- Avoid niche academic subjects

AVOID:
- Obscure historical figures only historians know
- Complex scientific theories (string theory, quantum mechanics)
- Regional history that isn't globally known`,
    systemPrompt: "You pick history and science subjects that are part of general education. If it's not in a typical high school curriculum or popular science documentary, it's too obscure."
  },
  sports: {
    name: "Sports",
    types: ["person", "place", "thing"],
    typeWeights: [0.34, 0.33, 0.33],
    subjectPrompt: `You are picking a famous SPORTS subject for a daily guessing game.

FOCUS AREAS:
- Legendary athletes across all major sports
- Iconic sports teams
- Famous stadiums and venues
- Historic sporting events and moments
- Sports equipment and concepts

EXAMPLES OF GOOD PICKS:
- People: Michael Jordan, Serena Williams, Muhammad Ali, Babe Ruth, Pele, Tiger Woods, Tom Brady, Usain Bolt
- Things: The Super Bowl, The Olympics, FIFA World Cup, The Stanley Cup, March Madness, The Kentucky Derby
- Places: Madison Square Garden, Wembley Stadium, Augusta National, Wimbledon, Yankee Stadium

CRITICAL RULES:
- Focus on athletes who transcended their sport into mainstream fame
- Include sports from around the world, not just American sports
- Pick subjects that even non-sports fans would recognize

AVOID:
- Current players who might not have lasting fame
- Niche sports with limited followings
- Recent controversies`,
    systemPrompt: "You pick sports legends and iconic moments that even people who don't follow sports would recognize. Michael Jordan, Olympics, Super Bowl level of fame."
  },
  geography: {
    name: "Geography",
    types: ["place", "thing", "person"],
    typeWeights: [0.34, 0.33, 0.33],
    subjectPrompt: `You are picking a famous GEOGRAPHY subject for a daily guessing game.

FOCUS AREAS:
- Famous cities and countries
- Natural wonders and landmarks
- World-famous tourist destinations
- Geographic features (mountains, rivers, deserts)
- Iconic structures and monuments

EXAMPLES OF GOOD PICKS:
- Places: The Amazon Rainforest, Mount Everest, The Grand Canyon, Tokyo, The Great Barrier Reef, Venice, Niagara Falls
- Things: The Northern Lights, The Sahara Desert, The Mississippi River, The Alps, Route 66
- People: Marco Polo, Christopher Columbus, Amelia Earhart (explorers who discovered/traveled places)

CRITICAL RULES:
- Focus on places that appear in travel shows and bucket lists
- Include natural wonders AND man-made landmarks
- Vary between continents and regions

AVOID:
- Small towns or regional places
- Places only known locally
- Controversial territorial disputes`,
    systemPrompt: "You pick geographic wonders and famous locations that everyone dreams of visiting or has seen in movies and documentaries. World-famous bucket list destinations."
  }
};

async function getRecentSubjects(supabase: any, category: DailyCategory, days: number = 14): Promise<string[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoff = cutoffDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_challenges")
    .select("challenges(target)")
    .eq("category", category)
    .gte("challenge_date", cutoff);

  if (error || !data) return [];

  return data
    .map((row: any) => row.challenges?.target)
    .filter((target: string | null) => target != null);
}

function selectTypeByWeight(types: string[], weights: number[]): "person" | "place" | "thing" {
  const random = Math.random();
  let cumulative = 0;
  for (let i = 0; i < types.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      return types[i] as "person" | "place" | "thing";
    }
  }
  return types[0] as "person" | "place" | "thing";
}

async function generateCategorySubject(
  category: DailyCategory,
  type: string,
  previousTarget: string | null,
  recentSubjects: string[],
  openaiKey: string
): Promise<string> {
  const config = CATEGORY_CONFIGS[category];
  const excludeList = [previousTarget, ...recentSubjects].filter(Boolean).join(", ");

  const categoryConstraints: Record<DailyCategory, string> = {
    sports: `STRICT REQUIREMENT: The ${type} MUST be directly related to SPORTS.
- If picking a PERSON: Must be an athlete, coach, sports commentator, or sports figure
- If picking a PLACE: Must be a stadium, arena, sports venue, or location famous for sports
- If picking a THING: Must be a sports event, trophy, sports equipment, or sports phenomenon
DO NOT pick general landmarks, mysteries, or anything not directly tied to athletics/sports.`,
    pop_culture: `STRICT REQUIREMENT: The ${type} MUST be directly related to POP CULTURE/ENTERTAINMENT.
- If picking a PERSON: Must be an entertainer, celebrity, or entertainment industry figure
- If picking a PLACE: Must be famous for entertainment/media (studios, entertainment venues)
- If picking a THING: Must be a movie, TV show, song, or entertainment phenomenon`,
    history_science: `STRICT REQUIREMENT: The ${type} MUST be directly related to HISTORY or SCIENCE.
- If picking a PERSON: Must be a historical figure, scientist, or inventor
- If picking a PLACE: Must be a historically significant location or scientific landmark
- If picking a THING: Must be an invention, discovery, or historical artifact`,
    geography: `STRICT REQUIREMENT: The ${type} MUST be a GEOGRAPHIC feature or location.
- If picking a PERSON: Must be an explorer or geographer
- If picking a PLACE: Must be a natural wonder, famous city, or geographic landmark
- If picking a THING: Must be a geographic feature (river, mountain range, desert, etc.)`
  };

  const prompt = `${config.subjectPrompt}

TYPE TO PICK: ${type}

${categoryConstraints[category]}

${excludeList ? `EXCLUSIONS - Do NOT pick any of these (used recently): ${excludeList}` : ''}

THE FAMILY FEUD STANDARD:
- Fame Level: 70-85% recognition among general public
- Would appear on Family Feud - recognizable but not the #1 obvious answer
- TEST: If you asked 100 random people at a shopping mall, would 70+ know it?

Respond with ONLY a JSON object:
{
  "target": "the ${type} you've chosen",
  "category_justification": "brief explanation of why this fits the ${config.name} category"
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
        { role: "system", content: config.systemPrompt + ` CRITICAL: Only pick subjects that are DIRECTLY and PRIMARILY associated with ${config.name}. Never pick subjects from other categories.` },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate category subject");
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  console.log(`[${category}] AI justification: ${result.category_justification}`);
  return result.target;
}

function base64UrlEncode(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function createToken(challenge: any, category: DailyCategory, difficulty: Difficulty): Promise<string> {
  const payload = {
    ver: 1,
    id: challenge.id,
    type: challenge.type,
    target: challenge.target,
    aliases: challenge.aliases || [challenge.target],
    hints: challenge.hints || {},
    createdAt: Math.floor(new Date(challenge.created_at).getTime() / 1000),
    isDaily: true,
    category,
    difficulty,
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
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin, { "Access-Control-Allow-Methods": "GET, OPTIONS" });

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const clientId = getClientIdentifier(req);
    const rateLimit = await checkRateLimit(clientId, {
      maxRequests: 20,
      windowMs: 60000,
    });

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please slow down." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const categoryParam = url.searchParams.get("category");
    const difficultyParam = url.searchParams.get("difficulty");

    if (!categoryParam || !VALID_CATEGORIES.includes(categoryParam as DailyCategory)) {
      return new Response(
        JSON.stringify({
          error: "Invalid or missing category parameter",
          valid_categories: VALID_CATEGORIES
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const category = categoryParam as DailyCategory;
    const difficulty: Difficulty = (difficultyParam && VALID_DIFFICULTIES.includes(difficultyParam as Difficulty))
      ? difficultyParam as Difficulty
      : "medium";
    const categoryConfig = CATEGORY_CONFIGS[category];

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
      .select("challenge_id, difficulty, challenges(*)")
      .eq("challenge_date", today)
      .eq("category", category)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existing && existing.challenges) {
      const challenge = existing.challenges as any;
      const existingDifficulty = (existing as any).difficulty || "medium";
      const token = await createToken(challenge, category, existingDifficulty as Difficulty);

      return new Response(
        JSON.stringify({
          challenge_id: challenge.id,
          token,
          date: today,
          type: challenge.type,
          category,
          category_name: categoryConfig.name,
          difficulty: existingDifficulty,
          message: "Daily challenge retrieved"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recentSubjects = await getRecentSubjects(supabase, category, 14);
    console.log(`[${category}] Avoiding ${recentSubjects.length} recent subjects:`, recentSubjects);

    const createUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/create-challenge-fast`;
    let challengeData = null;
    let totalAttempts = 0;
    const maxTotalAttempts = 9;
    const typesToTry = [...categoryConfig.types];

    while (!challengeData && totalAttempts < maxTotalAttempts && typesToTry.length > 0) {
      const currentType = typesToTry[0];
      let typeAttempts = 0;
      const maxTypeAttempts = 3;

      console.log(`[${category}] Trying type: ${currentType}`);

      while (!challengeData && typeAttempts < maxTypeAttempts) {
        totalAttempts++;
        typeAttempts++;

        let currentTarget: string;
        try {
          currentTarget = await generateCategorySubject(category, currentType, null, recentSubjects, openaiKey);
          console.log(`[${category}] AI generated target: ${currentTarget}`);
        } catch (aiError) {
          console.log(`[${category}] AI generation failed, using fallback`);
          const fallbacks = FALLBACK_SUBJECTS[category][currentType as keyof typeof FALLBACK_SUBJECTS[typeof category]];
          const availableFallbacks = fallbacks.filter(f => !recentSubjects.includes(f));
          if (availableFallbacks.length === 0) {
            console.log(`[${category}] No available fallbacks for ${currentType}, trying next type`);
            break;
          }
          currentTarget = availableFallbacks[Math.floor(Math.random() * availableFallbacks.length)];
          console.log(`[${category}] Using fallback target: ${currentTarget}`);
        }

        try {
          const createResponse = await fetch(createUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            },
            body: JSON.stringify({ type: currentType, target: currentTarget }),
          });

          if (createResponse.ok) {
            challengeData = await createResponse.json();
            console.log(`[${category}] Successfully created challenge for ${currentTarget}`);
            break;
          } else {
            const errorData = await createResponse.json();
            console.log(`[${category}] Attempt ${totalAttempts} failed for ${currentTarget}:`, errorData.error || errorData.reason);
            recentSubjects.push(currentTarget);
          }
        } catch (fetchError) {
          console.log(`[${category}] Fetch error on attempt ${totalAttempts}:`, fetchError);
        }

        if (typeAttempts < maxTypeAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!challengeData) {
        typesToTry.shift();
        if (typesToTry.length > 0) {
          console.log(`[${category}] Switching to next type: ${typesToTry[0]}`);
        }
      }
    }

    if (!challengeData) {
      console.log(`[${category}] All attempts failed, trying final fallback...`);
      const fallbackType = categoryConfig.types[0];
      const fallbacks = FALLBACK_SUBJECTS[category][fallbackType as keyof typeof FALLBACK_SUBJECTS[typeof category]];
      const availableFallbacks = fallbacks.filter(f => !recentSubjects.includes(f));

      if (availableFallbacks.length > 0) {
        const fallbackTarget = availableFallbacks[0];
        console.log(`[${category}] Final fallback attempt with: ${fallbackTarget}`);

        const createResponse = await fetch(createUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({ type: fallbackType, target: fallbackTarget }),
        });

        if (createResponse.ok) {
          challengeData = await createResponse.json();
        }
      }
    }

    if (!challengeData) {
      throw new Error(`Failed to generate challenge after ${totalAttempts} attempts across all types`);
    }

    const type = challengeData.type;

    const hintIndex = DIFFICULTY_TO_INDEX[difficulty];
    const selectedPhase1Index = hintIndex;
    const selectedPhase2Index = hintIndex;

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
        category,
        difficulty,
      });

    if (dailyInsertError) {
      throw dailyInsertError;
    }

    await supabase.from("challenge_metadata").insert({
      challenge_id: challengeData.challenge_id,
      is_daily: true,
      daily_date: today,
      selected_phase1_index: selectedPhase1Index,
      selected_phase2_index: selectedPhase2Index,
    });

    const token = await createToken(newChallenge, category, difficulty);

    return new Response(
      JSON.stringify({
        challenge_id: challengeData.challenge_id,
        token,
        date: today,
        type,
        category,
        category_name: categoryConfig.name,
        difficulty,
        message: "New daily challenge generated"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred loading the daily challenge" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});