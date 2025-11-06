import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function generateRandomSubject(type: string, previousTarget: string | null, openaiKey: string): Promise<string> {
  const prompt = `Generate a random famous ${type} for a mainstream guessing game played by average adults.

CRITICAL - READ THIS CAREFULLY:
- Must be recognizable to the GENERAL PUBLIC, not just educated/art enthusiasts
- Fame level: 4 out of 5 minimum - if 100 random Americans were surveyed, at least 60-70 would recognize the name
- Think "Family Feud survey says" or "Trivial Pursuit" level - NOT academic Jeopardy
- ${previousTarget ? `DO NOT suggest: ${previousTarget}` : ''}

THE TEST: Would your parents/grandparents know this? Would it be in a high school history/culture textbook?
✓ YES = Good choice
✗ NO = Too obscure, pick something else

${type === 'person' ? `
GOOD examples:
- Historical: Cleopatra, Abraham Lincoln, Julius Caesar, Queen Elizabeth I, Napoleon, Christopher Columbus
- Artists: Leonardo da Vinci, Vincent van Gogh, Pablo Picasso, Michelangelo (STOP at these famous ones!)
- Modern: Martin Luther King Jr., Rosa Parks, Muhammad Ali, Oprah Winfrey, Michael Jackson
- Scientists: Marie Curie, Isaac Newton, Charles Darwin, Thomas Edison

ABSOLUTELY AVOID:
- Contemporary/modern artists: Yayoi Kusama, Banksy, Ai Weiwei, Marina Abramović, Jeff Koons
- Niche historical figures: Ada Lovelace, Emmy Noether, lesser-known inventors
- Academic figures unless VERY famous (Einstein level)
- Anyone from art galleries/museums that isn't Leonardo/Van Gogh/Picasso/Michelangelo tier` : ''}
${type === 'place' ? `
GOOD examples:
- Landmarks: Big Ben, Taj Mahal, Sydney Opera House, Golden Gate Bridge, Mount Rushmore, Hollywood Sign
- Natural: Grand Canyon, Niagara Falls, Mount Everest, Great Barrier Reef, Yellowstone
- Historical: Stonehenge, Colosseum, Parthenon, Machu Picchu

ABSOLUTELY AVOID:
- Lesser-known temples/shrines
- Regional landmarks most Americans haven't heard of
- Contemporary architecture unless iconic` : ''}
${type === 'thing' ? `
GOOD examples:
- Art: Statue of David, The Last Supper, The Thinker (stick to the MOST famous)
- Brands: Coca-Cola, Nike Swoosh, McDonald's Golden Arches, Disney
- Icons: Liberty Bell, Olympic Rings, Hollywood Sign, Super Bowl Trophy, Oscar Statuette
- Inventions: Light Bulb, Telephone, Television, Airplane

ABSOLUTELY AVOID:
- "The Great Wave off Kanagawa" or any Japanese prints
- Contemporary art pieces
- Obscure paintings/sculptures
- Academic/niche objects` : ''}

IMPORTANT: If you're even SLIGHTLY unsure if the average person would know it, pick something more mainstream!

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
          content: "You are selecting subjects for a MAINSTREAM guessing game. Your audience is average American adults watching game shows, NOT art students or academics. Think 'Family Feud' level recognition - would 60+ out of 100 random people recognize this name? If not, pick something more famous. Avoid contemporary artists and niche academic subjects completely."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
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
