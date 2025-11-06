import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function generateRandomSubject(type: string, previousTarget: string | null, openaiKey: string): Promise<string> {
  const prompt = `Generate a random famous ${type} for a deduction-based guessing game where players get progressive hints.

CRITICAL REQUIREMENTS:
- Fame level: 3-4 out of 5 (well-known but NOT the most obvious household name)
- Must be guessable with good hints, but not instantly obvious
- Appropriate for a public game (no controversial/sensitive figures)
- ${previousTarget ? `DO NOT suggest: ${previousTarget}` : ''}

VARIETY INSTRUCTIONS - Actively avoid the "first thought" famous options:
${type === 'person' ? `
- Mix eras: ancient, medieval, renaissance, modern, contemporary
- Vary fields: science, arts, sports, politics, entertainment, literature, philosophy
- Include different regions: European, Asian, African, American, Middle Eastern
- Balance genders and avoid only Western figures
- Examples of GOOD variety: Ada Lovelace, Genghis Khan, Frida Kahlo, Bruce Lee, Jane Austen, Nikola Tesla
- AVOID the most obvious: Einstein, Shakespeare, Lincoln, Gandhi, etc.` : ''}
${type === 'place' ? `
- Mix types: cities, natural wonders, buildings, monuments, regions
- Vary locations: all continents, famous and interesting but not just the "big 7"
- Include: ancient sites, modern cities, natural formations, cultural landmarks
- Examples of GOOD variety: Angkor Wat, The Colosseum, Mount Fuji, Petra, Venice, Santorini
- AVOID the most obvious: Eiffel Tower, Statue of Liberty, Great Wall, Pyramids, etc.` : ''}
${type === 'thing' ? `
- Mix categories: inventions, artworks, brands, cultural phenomena, historical objects
- Vary time periods: ancient artifacts, classic art, modern tech, pop culture
- Include: famous paintings, iconic products, scientific tools, cultural symbols
- Examples of GOOD variety: The Thinker, Rubik's Cube, Starry Night, Coca-Cola, The Declaration of Independence
- AVOID the most obvious: Mona Lisa, iPhone, Bitcoin, etc.` : ''}

The goal is to make players think and deduce, not guess in 1 second. Pick something INTERESTING and VARIED.

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
          content: "You are a creative puzzle designer who specializes in picking interesting, varied, and engaging subjects for guessing games. Avoid clichés and the most obvious choices. Surprise the player with variety while keeping subjects recognizable to educated audiences."
        },
        { role: "user", content: prompt }
      ],
      temperature: 1.2,
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

    // Get existing daily challenge
    const { data: existing } = await supabase
      .from("daily_challenges")
      .select("challenge_id, challenges(target, type)")
      .eq("challenge_date", today)
      .maybeSingle();

    let previousTarget = null;
    let previousType = null;
    if (existing) {
      const challenge = existing.challenges as any;
      previousTarget = challenge?.target;
      previousType = challenge?.type;
      
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

    // Generate random subject using AI
    const target = await generateRandomSubject(type, previousTarget, openaiKey);

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
        body: JSON.stringify({ type, target }),
      });

      if (createResponse.ok) {
        challengeData = await createResponse.json();
        break;
      } else {
        const errorData = await createResponse.json();
        console.log(`Attempt ${attempts} failed for ${target}:`, errorData);
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate challenge after ${maxAttempts} attempts: ${errorData.error || errorData.reason}`);
        }
        // Try a different target
        target = await generateRandomSubject(type, target, openaiKey);
      }
    }

    // Randomly choose difficulty
    const selectedPhase1Index = Math.floor(Math.random() * 3);
    const selectedPhase2Index = Math.floor(Math.random() * 3);

    // Insert the challenge
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

    // Insert into daily_challenges
    const { error: dailyInsertError } = await supabase
      .from("daily_challenges")
      .insert({
        challenge_date: today,
        challenge_id: challengeData.challenge_id,
      });

    if (dailyInsertError) {
      throw dailyInsertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        type: challengeData.type,
        target: challengeData.target,
        message: `New daily challenge: ${challengeData.target}`,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
