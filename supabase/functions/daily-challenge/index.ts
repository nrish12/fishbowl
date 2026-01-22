import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  "Access-Control-Max-Age": "86400",
};

type DailyCategory = "pop_culture" | "history_science" | "sports" | "geography";

const VALID_CATEGORIES: DailyCategory[] = ["pop_culture", "history_science", "sports", "geography"];

interface CategoryConfig {
  name: string;
  types: ("person" | "place" | "thing")[];
  typeWeights: number[];
  subjectPrompt: string;
  systemPrompt: string;
}

const CATEGORY_CONFIGS: Record<DailyCategory, CategoryConfig> = {
  pop_culture: {
    name: "Pop Culture",
    types: ["person", "thing", "place"],
    typeWeights: [0.6, 0.3, 0.1],
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
    typeWeights: [0.5, 0.35, 0.15],
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
    typeWeights: [0.7, 0.15, 0.15],
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
    typeWeights: [0.7, 0.2, 0.1],
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

  const prompt = `${config.subjectPrompt}

TYPE TO PICK: ${type}

${excludeList ? `EXCLUSIONS - Do NOT pick any of these (used recently): ${excludeList}` : ''}

THE FAMILY FEUD STANDARD:
- Fame Level: 70-85% recognition among general public
- Would appear on Family Feud - recognizable but not the #1 obvious answer
- TEST: If you asked 100 random people at a shopping mall, would 70+ know it?

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
        { role: "system", content: config.systemPrompt },
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

async function createToken(challenge: any, category: DailyCategory): Promise<string> {
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
    const url = new URL(req.url);
    const categoryParam = url.searchParams.get("category");

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
      .select("challenge_id, challenges(*)")
      .eq("challenge_date", today)
      .eq("category", category)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existing && existing.challenges) {
      const challenge = existing.challenges as any;
      const token = await createToken(challenge, category);

      return new Response(
        JSON.stringify({
          challenge_id: challenge.id,
          token,
          date: today,
          type: challenge.type,
          category,
          category_name: categoryConfig.name,
          message: "Daily challenge retrieved"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recentSubjects = await getRecentSubjects(supabase, category, 14);
    console.log(`[${category}] Avoiding ${recentSubjects.length} recent subjects:`, recentSubjects);

    const type = selectTypeByWeight(categoryConfig.types, categoryConfig.typeWeights);
    console.log(`[${category}] Selected type: ${type}`);

    const target = await generateCategorySubject(category, type, null, recentSubjects, openaiKey);
    console.log(`[${category}] Generated target: ${target}`);

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
        console.log(`[${category}] Attempt ${attempts} failed for ${currentTarget}:`, errorData.error || errorData.reason);
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate challenge after ${maxAttempts} attempts: ${errorData.error || errorData.reason}`);
        }
        currentTarget = await generateCategorySubject(category, type, currentTarget, recentSubjects, openaiKey);
      }
    }

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
        category,
      });

    if (dailyInsertError) {
      throw dailyInsertError;
    }

    const token = await createToken(newChallenge, category);

    return new Response(
      JSON.stringify({
        challenge_id: challengeData.challenge_id,
        token,
        date: today,
        type,
        category,
        category_name: categoryConfig.name,
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