const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SESSION_KEY = 'clueladder_session_id';
const VISIT_START_KEY = 'clueladder_visit_start';

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, sessionId);

    if (window.Sentry) {
      window.Sentry.setUser({ id: sessionId });
    }
  }
  return sessionId;
}

export async function trackPageView(pagePath: string, pageTitle: string): Promise<void> {
  try {
    const isLandingPage = !sessionStorage.getItem('has_viewed_page');
    sessionStorage.setItem('has_viewed_page', 'true');

    await fetch(`${SUPABASE_URL}/rest/v1/page_views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        session_id: getSessionId(),
        page_path: pagePath,
        page_title: pageTitle,
        referrer: document.referrer || null,
        landing_page: isLandingPage,
      }),
    });

    if (!localStorage.getItem(VISIT_START_KEY)) {
      localStorage.setItem(VISIT_START_KEY, Date.now().toString());
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

export async function trackInteraction(
  interactionType: string,
  elementId?: string,
  elementText?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/user_interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        session_id: getSessionId(),
        interaction_type: interactionType,
        element_id: elementId || null,
        element_text: elementText || null,
        page_path: window.location.pathname,
        metadata: metadata || {},
      }),
    });
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }
}

export async function updateSessionMetrics(): Promise<void> {
  try {
    const visitStart = localStorage.getItem(VISIT_START_KEY);
    if (!visitStart) return;

    const totalTimeSeconds = Math.floor((Date.now() - parseInt(visitStart)) / 1000);

    await fetch(`${SUPABASE_URL}/rest/v1/session_metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        session_id: getSessionId(),
        last_activity: new Date().toISOString(),
        total_time_seconds: totalTimeSeconds,
        referrer_source: document.referrer ? new URL(document.referrer).hostname : null,
      }),
    });
  } catch (error) {
    console.error('Error updating session metrics:', error);
  }
}

export function getReferrerSource(): string | null {
  if (!document.referrer) return null;
  try {
    return new URL(document.referrer).hostname;
  } catch {
    return null;
  }
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
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
      `${SUPABASE_URL}/functions/v1/get-leaderboard?challenge_id=${challengeId}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
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
