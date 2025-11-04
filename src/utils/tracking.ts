const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SESSION_KEY = 'clueladder_session_id';

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export async function logPreview(
  type: string,
  targetInput: string,
  generatedPhase1Options: string[][],
  generatedPhase2Options: string[],
  generatedPhase3: any,
  generatedAliases: string[]
): Promise<string | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/log-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        target_input: targetInput,
        generated_phase1_options: generatedPhase1Options,
        generated_phase2_options: generatedPhase2Options,
        generated_phase3: generatedPhase3,
        generated_aliases: generatedAliases,
        session_id: getSessionId(),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.preview_id;
    }
    return null;
  } catch (error) {
    console.error('Error logging preview:', error);
    return null;
  }
}

export async function trackEvent(
  eventType: 'visit' | 'attempt' | 'completion' | 'share',
  challengeId: string,
  data?: any
): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/track-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: eventType,
        challenge_id: challengeId,
        session_id: getSessionId(),
        data,
      }),
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

export async function getLeaderboard(challengeId: string): Promise<any> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/get-leaderboard?challenge_id=${challengeId}`
    );

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return null;
  }
}
