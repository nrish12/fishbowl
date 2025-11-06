import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FAMOUS_SUBJECTS = {
  person: [
    "Albert Einstein", "Leonardo da Vinci", "Marie Curie", "William Shakespeare",
    "Cleopatra", "Napoleon Bonaparte", "Nelson Mandela", "Martin Luther King Jr.",
    "Frida Kahlo", "Pablo Picasso", "Mozart", "Beethoven", "Elvis Presley",
    "Michael Jordan", "Muhammad Ali", "Serena Williams", "Oprah Winfrey",
    "Steve Jobs", "Bill Gates", "Elon Musk", "Barack Obama", "Queen Elizabeth II"
  ],
  place: [
    "Eiffel Tower", "Great Wall of China", "Taj Mahal", "Grand Canyon",
    "Mount Everest", "Statue of Liberty", "Colosseum", "Machu Picchu",
    "Pyramids of Giza", "Stonehenge", "Niagara Falls", "Amazon Rainforest",
    "Sahara Desert", "Great Barrier Reef", "Antarctica", "Yellowstone",
    "Venice", "Tokyo", "Paris", "New York City", "London", "Sydney Opera House"
  ],
  thing: [
    "Mona Lisa", "iPhone", "Coca-Cola", "Tesla", "Nike shoes", "Lego",
    "Harry Potter books", "Star Wars", "Bitcoin", "Internet", "Wheel",
    "Light bulb", "Airplane", "Telescope", "Microscope", "Bicycle",
    "Piano", "Guitar", "Camera", "Television", "Smartphone", "Computer"
  ]
};

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

    const today = new Date().toISOString().split("T")[0];

    // Get existing daily challenge to find what we had before
    const { data: existing } = await supabase
      .from("daily_challenges")
      .select("challenge_id, challenges(target)")
      .eq("challenge_date", today)
      .maybeSingle();

    let previousTarget = null;
    if (existing) {
      previousTarget = (existing.challenges as any)?.target;
      
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

    // Determine type based on day
    const types = ["person", "place", "thing"] as const;
    const typeIndex = new Date().getDate() % 3;
    const type = types[typeIndex];
    const subjects = FAMOUS_SUBJECTS[type];

    // Filter out the previous target to ensure we get something different
    const availableSubjects = previousTarget 
      ? subjects.filter(s => s !== previousTarget)
      : subjects;

    // Try up to 5 times to generate a new challenge
    const createUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/create-challenge-fast`;
    let challengeData = null;
    let attempts = 0;
    const maxAttempts = 5;

    while (!challengeData && attempts < maxAttempts) {
      const subjectIndex = Math.floor(Math.random() * availableSubjects.length);
      const target = availableSubjects[subjectIndex];
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
        console.log(`Attempt ${attempts} failed for ${target}`);
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate challenge after ${maxAttempts} attempts`);
        }
      }
    }

    // Randomly choose difficulty
    const selectedPhase1Index = Math.random() < 0.5 ? 1 : 2;
    const selectedPhase2Index = Math.random() < 0.5 ? 1 : 2;

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
