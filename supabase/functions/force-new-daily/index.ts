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
- Must be recognizable to the GENERAL PUBLIC (60-70% of random Americans would know the name)
- Think "Family Feud survey says" or "Trivial Pursuit" level
- ${previousTarget ? `DO NOT suggest: ${previousTarget}` : ''}

THE SWEET SPOT: Recognizable but not the FIRST name everyone thinks of.

THE TEST: Would it appear in a middle school textbook? Would your parents know it? Then it's good!

${type === 'person' ? `
GOOD examples (pick from these types):
- Historical Leaders: Cleopatra, Julius Caesar, Queen Elizabeth I, Napoleon, Christopher Columbus
- Civil Rights: Martin Luther King Jr., Rosa Parks, Harriet Tubman, Gandhi
- Artists (classical only): Leonardo da Vinci, Vincent van Gogh, Pablo Picasso, Michelangelo, Frida Kahlo
- Scientists: Marie Curie, Isaac Newton, Charles Darwin, Galileo, Thomas Edison, Alexander Graham Bell
- Modern Icons: Muhammad Ali, Oprah Winfrey, Michael Jackson, Elvis Presley, Walt Disney

ABSOLUTELY DO NOT USE - TOO OBVIOUS/OVERUSED:
- Albert Einstein (TOO common in trivia)
- George Washington, Abraham Lincoln (TOO obvious for Americans)
- Jesus, Moses, Buddha (too obvious)
- Shakespeare (TOO common)
- Any contemporary artists (Yayoi Kusama, Banksy, etc.)` : ''}
${type === 'place' ? `
GOOD examples (pick from these types):
- Landmarks: Big Ben, Taj Mahal, Sydney Opera House, Golden Gate Bridge, Mount Rushmore, Hollywood Sign, Leaning Tower of Pisa
- Natural: Grand Canyon, Niagara Falls, Mount Everest, Great Barrier Reef, Yellowstone, Victoria Falls, Amazon Rainforest
- Ancient/Historical: Stonehenge, Colosseum, Parthenon, Roman Forum, Acropolis

ABSOLUTELY DO NOT USE - TOO OBVIOUS/OVERUSED:
- Eiffel Tower (TOO obvious)
- Statue of Liberty (TOO obvious)
- Great Wall of China (TOO obvious)
- Pyramids of Giza (TOO obvious)
- Machu Picchu (OVERUSED in this game)
- Any obscure temples or regional sites` : ''}
${type === 'thing' ? `
GOOD examples (pick from these types):
- Classic Art: Statue of David, The Last Supper, The Thinker, The Scream
- Famous Brands: Coca-Cola, Nike Swoosh, McDonald's Golden Arches, Disney, Lego
- Icons: Liberty Bell, Olympic Rings, Hollywood Sign, Super Bowl Trophy, Oscar Statuette, Grammy
- Historical Objects: Declaration of Independence, Rosetta Stone, Dead Sea Scrolls
- Inventions: Light Bulb, Telephone, Television, Airplane, Automobile, Printing Press

ABSOLUTELY DO NOT USE - TOO OBVIOUS/OVERUSED:
- Mona Lisa (TOO obvious)
- iPhone (TOO obvious/modern)
- Bitcoin (TOO obvious/modern)
- "The Great Wave off Kanagawa" (too obscure)
- Any contemporary art or niche objects` : ''}

IMPORTANT: Pick something VARIED. Don't just pick the most famous - pick from the SECOND tier of fame that's still very recognizable!

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
          content: "You are selecting subjects for a MAINSTREAM guessing game. Your audience is average American adults. Pick subjects that are famous and recognizable, but NOT the most overused trivia answers. Avoid Einstein, Eiffel Tower, Mona Lisa, etc. - pick the SECOND tier of fame that's still very recognizable. Think variety and interest, not just the most obvious."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.85,
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
