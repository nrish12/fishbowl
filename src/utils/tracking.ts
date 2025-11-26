import { fetchWithTimeout } from './fetchWithTimeout';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SESSION_KEY = 'mystle_session_id';
const VISIT_START_KEY = 'mystle_visit_start';

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

    await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/page_views`, {
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
      timeout: 5000,
    });

    if (!localStorage.getItem(VISIT_START_KEY)) {
      localStorage.setItem(VISIT_START_KEY, Date.now().toString());
    }
  } catch (error) {
    // Fail silently
  }
}

export async function trackInteraction(
  interactionType: string,
  elementId?: string,
  elementText?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/user_interactions`, {
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
      timeout: 5000,
    });
  } catch (error) {
    // Fail silently
  }
}

export async function updateSessionMetrics(): Promise<void> {
  try {
    const visitStart = localStorage.getItem(VISIT_START_KEY);
    if (!visitStart) return;

    const totalTimeSeconds = Math.floor((Date.now() - parseInt(visitStart)) / 1000);
    const sessionId = getSessionId();

    // Use PATCH with filter to update existing or ignore if doesn't exist
    const updateResponse = await fetchWithTimeout(
      `${SUPABASE_URL}/rest/v1/session_metrics?session_id=eq.${sessionId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          last_activity: new Date().toISOString(),
          total_time_seconds: totalTimeSeconds,
        }),
        timeout: 5000,
      }
    );

    // If no rows were updated (first visit), insert new record
    if (updateResponse.status === 200 && updateResponse.headers.get('content-range') === '0-0/*') {
      await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/session_metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          session_id: sessionId,
          last_activity: new Date().toISOString(),
          total_time_seconds: totalTimeSeconds,
          referrer_source: document.referrer ? new URL(document.referrer).hostname : null,
        }),
        timeout: 5000,
      });
    }
  } catch (error) {
    // Fail silently
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
    const response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/log-preview`, {
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
      timeout: 10000,
    });

    if (response.ok) {
      const data = await response.json();
      return data.preview_id;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function trackEvent(
  eventType: 'visit' | 'attempt' | 'completion' | 'share',
  challengeId: string,
  data?: any
): Promise<void> {
  try {
    await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/track-event`, {
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
      timeout: 5000,
    });
  } catch (error) {
    // Fail silently
  }
}

export async function getLeaderboard(challengeId: string): Promise<any> {
  try {
    const response = await fetchWithTimeout(
      `${SUPABASE_URL}/functions/v1/get-leaderboard?challenge_id=${challengeId}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        timeout: 10000,
      }
    );

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    return null;
  }
}
