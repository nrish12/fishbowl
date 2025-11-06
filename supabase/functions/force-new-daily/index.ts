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
- Fame level: 3.5-4 out of 5 (recognizable to most educated adults, but not the first name everyone thinks of)
- Must be REASONABLY GUESSABLE - if someone gets good hints, they should be able to figure it out
- NOT too niche or specialized (avoid deep-cut art history, obscure figures, etc.)
- Appropriate for a public game (no controversial/sensitive figures)
- ${previousTarget ? `DO NOT suggest: ${previousTarget}` : ''}

THE SWEET SPOT - Pick subjects that are:
✓ Famous enough that most adults have heard of them
✓ Interesting and varied (not the same predictable choices)
✓ Solvable with good deductive hints
✗ NOT instant guesses (avoid Einstein, Mona Lisa level obvious)
✗ NOT too obscure (avoid niche academic knowledge)

${type === 'person' ? `
GOOD examples: Cleopatra, Rosa Parks, Leonardo da Vinci, Martin Luther King Jr., Marie Curie, Beethoven, Vincent van Gogh, Serena Williams, Nelson Mandela, Abraham Lincoln
AVOID TOO OBVIOUS: Albert Einstein, George Washington, Jesus, Shakespeare
AVOID TOO OBSCURE: Ada Lovelace, Emmy Noether, obscure historical figures
- Mix eras and fields, but keep them recognizable` : ''}
${type === 'place' ? `
GOOD examples: Grand Canyon, Big Ben, Mount Rushmore, Niagara Falls, Stonehenge, Sydney Opera House, Taj Mahal, Golden Gate Bridge, Machu Picchu, Great Barrier Reef
AVOID TOO OBVIOUS: Eiffel Tower, Statue of Liberty
AVOID TOO OBSCURE: Lesser-known temples, obscure monuments
- Mix natural and man-made, but keep them recognizable` : ''}
${type === 'thing' ? `
GOOD examples: Statue of David, Golden Gate Bridge, Hubble Telescope, Super Bowl Trophy, Oscar Statuette, Liberty Bell, Coca-Cola, Nike Swoosh, Hollywood Sign, Monopoly
AVOID TOO OBVIOUS: iPhone, Mona Lisa, Bitcoin
AVOID TOO OBSCURE: "The Great Wave off Kanagawa", niche artworks, academic objects
- Mix art, brands, inventions, and cultural icons - but keep them mainstream recognizable` : ''}

Pick something in that sweet spot: famous enough to be fair, interesting enough to not be boring.

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
          content: "You are a puzzle designer for a mainstream guessing game. Pick subjects that are famous and recognizable to most educated adults - not too obvious, but definitely not obscure. Think 'Jeopardy' level knowledge, not art history PhD."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.95,
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
