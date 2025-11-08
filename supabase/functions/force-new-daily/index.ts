import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function generateRandomSubject(type: string, previousTarget: string | null, openaiKey: string): Promise<string> {
  const prompt = `Generate a random famous ${type} for a mainstream guessing game played by average adults.

CRITICAL - TRUE RANDOMNESS REQUIRED:
- Must be recognizable to the GENERAL PUBLIC (60-70% of random Americans would know it)
- Think "Family Feud" or "Trivial Pursuit" level recognition
- ${previousTarget ? `DO NOT suggest: ${previousTarget}` : ''}

VARIETY IS KEY - DO NOT DEFAULT TO THE SAME SAFE CHOICES:
This is for a DAILY challenge that changes every day. Players should see DIFFERENT subjects regularly.

Your thought process:
1. Think of 5-7 different options in the ${type} category
2. Pick one that is NOT the most obvious/overused trivia answer
3. Rotate between different eras, fields, and regions
4. Avoid picking the same "safe" choices every time

${type === 'person' ? `
Good variety pool (rotate between these types):
- Ancient Leaders: Cleopatra, Julius Caesar, Alexander the Great
- Renaissance: Leonardo da Vinci, Michelangelo, Galileo
- Scientists: Marie Curie, Isaac Newton, Charles Darwin, Nikola Tesla, Thomas Edison, Alexander Graham Bell
- US Presidents: George Washington, Abraham Lincoln, Theodore Roosevelt, Franklin D. Roosevelt
- Civil Rights: Martin Luther King Jr., Rosa Parks, Harriet Tubman, Gandhi, Nelson Mandela
- Artists: Vincent van Gogh, Pablo Picasso, Frida Kahlo, Rembrandt, Monet
- Modern Icons: Albert Einstein, Muhammad Ali, Oprah Winfrey, Michael Jackson, Elvis Presley, Walt Disney, Steve Jobs
- Religious: Jesus, Moses, Buddha, Muhammad
- Writers: Shakespeare, Mark Twain, Jane Austen, Ernest Hemingway
- Explorers: Christopher Columbus, Marco Polo, Amelia Earhart

Don't always pick Einstein or Shakespeare - rotate through ALL of these equally!` : ''}
${type === 'place' ? `
Good variety pool (rotate between these types):
- European Icons: Eiffel Tower, Big Ben, Colosseum, Stonehenge, Leaning Tower of Pisa, Parthenon
- World Landmarks: Taj Mahal, Great Wall of China, Pyramids of Giza, Statue of Liberty, Sydney Opera House, Christ the Redeemer
- Natural Wonders: Grand Canyon, Mount Everest, Niagara Falls, Great Barrier Reef, Victoria Falls, Amazon Rainforest, Yellowstone
- Ancient Sites: Machu Picchu, Petra, Angkor Wat, Roman Forum, Acropolis
- Modern: Golden Gate Bridge, Mount Rushmore, Hollywood Sign, Space Needle, CN Tower

Don't always pick Eiffel Tower or Machu Picchu - rotate through ALL of these equally!` : ''}
${type === 'thing' ? `
Good variety pool (rotate between these types):
- Classic Art: Mona Lisa, Statue of David, The Last Supper, The Thinker, The Scream, Starry Night
- Brands: Coca-Cola, Nike Swoosh, McDonald's Golden Arches, Disney, Apple logo, Lego, Starbucks
- Icons: Liberty Bell, Olympic Rings, Hollywood Sign, Super Bowl Trophy, Oscar Statuette, Grammy, Nobel Prize
- Historical: Declaration of Independence, Constitution, Rosetta Stone, Dead Sea Scrolls, Magna Carta
- Inventions: Light Bulb, Telephone, Television, Airplane, Automobile, Printing Press, Internet, Wheel
- Modern Tech: iPhone, Computer, Laptop, Bitcoin, GPS

Don't always pick Mona Lisa or iPhone - rotate through ALL of these equally!` : ''}

IMPORTANT: Think of this as a rotation system. Pick something different from what you'd normally default to!

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
          content: "You are selecting subjects for a DAILY guessing game that changes every day. Your goal is TRUE RANDOMNESS and VARIETY. Don't default to the same 'safe' choices like Einstein or Eiffel Tower every time. Think of 5 options and pick one that's NOT the most obvious. Rotate between different eras, regions, and fields. Make each day feel fresh and different!"
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
