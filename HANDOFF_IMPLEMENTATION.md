# ClueLadder Implementation Handoff Document

**Date:** November 4, 2025
**Purpose:** Complete implementation guide for production readiness
**Estimated Time:** 4-6 hours for full implementation

---

## 📋 IMPLEMENTATION CHECKLIST

This document covers implementing these improvements:

1. ✅ Security - Fix CORS vulnerabilities
2. ✅ Performance - Add rate limiting for AI endpoints
5. ✅ Progress Persistence - Save game state
7. ✅ Error Handling - React Error Boundaries
8. ✅ Monitoring - Sentry integration
9. ✅ SEO - Meta tags and OG images
10. ✅ Rate Limiting - Protect expensive endpoints
13. ✅ Daily Leaderboard - Global rankings
15. ✅ Share Cards - Shareable results
17. ✅ Report System - User moderation
18. ✅ Testing - Basic test suite
19. ✅ CI/CD - GitHub Actions
20. ✅ Documentation - README updates
21. ✅ Accessibility - ARIA labels
23. ✅ Monetization - Ad integration (no premium/API)

---

## 🚀 PART 1: SECURITY FIXES (CRITICAL - DO FIRST)

### 1.1 Fix CORS Headers

**Files to Update:**
- `supabase/functions/validate-challenge/index.ts`
- `supabase/functions/check-guess/index.ts`
- `supabase/functions/finalize-challenge/index.ts`
- `supabase/functions/track-event/index.ts`
- `supabase/functions/get-leaderboard/index.ts`
- `supabase/functions/log-preview/index.ts`
- `supabase/functions/resolve-challenge/index.ts`
- `supabase/functions/daily-challenge/index.ts`

**Change in ALL edge functions:**

```typescript
// OLD (INSECURE):
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// NEW (SECURE):
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://yourdomain.com", // REPLACE WITH YOUR ACTUAL DOMAIN
  "https://www.yourdomain.com" // REPLACE WITH YOUR ACTUAL DOMAIN
];

function getCorsHeaders(origin: string | null) {
  const corsHeaders = {
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && allowedOrigins.includes(origin)) {
    return {
      ...corsHeaders,
      "Access-Control-Allow-Origin": origin,
    };
  }

  // Default to first allowed origin for non-browser requests
  return {
    ...corsHeaders,
    "Access-Control-Allow-Origin": allowedOrigins[0],
  };
}

// Then in your Deno.serve handler:
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // ... rest of function

  // Update all Response returns to use the dynamic corsHeaders:
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
```

**Action:** Update ALL 8 edge functions with this CORS fix.

---

### 1.2 Add Environment Variable Validation

**Create new file:** `supabase/functions/_shared/env-validation.ts`

```typescript
export function validateEnv(required: string[]): void {
  const missing: string[] = [];

  for (const envVar of required) {
    if (!Deno.env.get(envVar)) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export function getEnvOrThrow(key: string): string {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
```

**Update edge functions to use it:**

```typescript
// At top of validate-challenge/index.ts
import { validateEnv } from "../_shared/env-validation.ts";

Deno.serve(async (req: Request) => {
  validateEnv(["OPENAI_API_KEY"]);

  // ... rest of function
});
```

---

## 🔒 PART 2: RATE LIMITING (CRITICAL)

### 2.1 Install Upstash Redis

```bash
npm install @upstash/ratelimit @upstash/redis
```

### 2.2 Create Rate Limiting Utility

**Create file:** `supabase/functions/_shared/rate-limit.ts`

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
});

// Expensive AI endpoints - 5 per minute per IP
export const aiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
});

// Guess checking - 30 per minute per IP
export const guessRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
});

// Tracking - 100 per minute per IP
export const trackingRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
});

export async function checkRateLimit(
  req: Request,
  limiter: Ratelimit
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const identifier = req.headers.get("x-forwarded-for") ||
                     req.headers.get("x-real-ip") ||
                     "anonymous";

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return { success, limit, remaining, reset };
}
```

### 2.3 Apply Rate Limiting to Edge Functions

**Update `validate-challenge/index.ts`:**

```typescript
import { aiRatelimit, checkRateLimit } from "../_shared/rate-limit.ts";

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // ADD RATE LIMITING
  const rateLimitResult = await checkRateLimit(req, aiRatelimit);

  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        reason: "Too many validation requests. Please wait a moment and try again.",
        retry_after: rateLimitResult.reset
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        }
      }
    );
  }

  // ... rest of function
});
```

**Apply same pattern to:**
- `check-guess/index.ts` (use `guessRatelimit`)
- `track-event/index.ts` (use `trackingRatelimit`)

### 2.4 Add Environment Variables

**Create file:** `.env.example`

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Sentry (Error Monitoring)
VITE_SENTRY_DSN=https://your-sentry-dsn

# Google AdSense (Monetization)
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXX

# Edge Functions Environment Variables (Server-side only - DO NOT prefix with VITE_)
OPENAI_API_KEY=sk-...
CHALLENGE_SIGNING_SECRET=your_secret_key_minimum_32_chars
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_URL=https://your-project.supabase.co

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

**Set these in:**
1. Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Your local `.env` file (copy from `.env.example`)

---

## 🎮 PART 3: PROGRESS PERSISTENCE

### 3.1 Update PlayChallenge Component

**File:** `src/pages/PlayChallenge.tsx`

Add these functions:

```typescript
// Add near top of component
const STORAGE_KEY_PREFIX = 'clueladder_progress_';

// Save progress to localStorage
const saveProgress = useCallback(() => {
  if (!challengeId) return;

  const progress = {
    phase,
    lives,
    guesses,
    wrongGuesses,
    startTime,
    selectedCategory,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${challengeId}`, JSON.stringify(progress));
  } catch (error) {
    console.warn('Failed to save progress:', error);
  }
}, [challengeId, phase, lives, guesses, wrongGuesses, startTime, selectedCategory]);

// Load progress from localStorage
const loadProgress = useCallback(() => {
  if (!challengeId) return null;

  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${challengeId}`);
    if (!saved) return null;

    const progress = JSON.parse(saved);

    // Don't load if game was completed or failed
    if (gameState === 'solved' || gameState === 'failed') {
      return null;
    }

    // Don't load if saved more than 24 hours ago
    const hoursSinceSave = (Date.now() - progress.timestamp) / (1000 * 60 * 60);
    if (hoursSinceSave > 24) {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${challengeId}`);
      return null;
    }

    return progress;
  } catch (error) {
    console.warn('Failed to load progress:', error);
    return null;
  }
}, [challengeId, gameState]);

// Clear progress when game ends
const clearProgress = useCallback(() => {
  if (!challengeId) return;
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${challengeId}`);
}, [challengeId]);

// Load progress on mount
useEffect(() => {
  if (challengeId && gameState === 'playing') {
    const progress = loadProgress();
    if (progress) {
      setPhase(progress.phase);
      setLives(progress.lives);
      setGuesses(progress.guesses);
      setWrongGuesses(progress.wrongGuesses);
      setStartTime(progress.startTime);
      setSelectedCategory(progress.selectedCategory);
    }
  }
}, [challengeId, gameState]);

// Save progress whenever it changes
useEffect(() => {
  if (gameState === 'playing') {
    saveProgress();
  } else if (gameState === 'solved' || gameState === 'failed') {
    clearProgress();
  }
}, [gameState, phase, lives, guesses, wrongGuesses, selectedCategory, saveProgress, clearProgress]);
```

---

## 🛡️ PART 4: ERROR HANDLING

### 4.1 Create Error Boundary Component

**Create file:** `src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Log to Sentry if available
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg border-2 border-red-200 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold text-neutral-900">
                Oops! Something went wrong
              </h2>
              <p className="text-neutral-600">
                We encountered an unexpected error. Don't worry, your progress might be saved.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="bg-red-50 rounded-lg p-4 text-left">
                <p className="text-xs font-mono text-red-800 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Reload Page
              </button>

              <Link
                to="/"
                className="w-full px-6 py-3 bg-neutral-100 text-neutral-900 rounded-full font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 4.2 Wrap App with Error Boundary

**File:** `src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
```

---

## 📊 PART 5: MONITORING (SENTRY)

### 5.1 Install Sentry

```bash
npm install @sentry/react
```

### 5.2 Initialize Sentry

**Update file:** `src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Initialize Sentry
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    beforeSend(event) {
      // Don't send events in development
      if (import.meta.env.DEV) return null;
      return event;
    },
  });
}

// Add to window for ErrorBoundary
declare global {
  interface Window {
    Sentry: typeof Sentry;
  }
}
window.Sentry = Sentry;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
```

### 5.3 Add User Context Tracking

**Update file:** `src/utils/tracking.ts`

```typescript
import * as Sentry from '@sentry/react';

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, sessionId);

    // Set Sentry user context
    if (window.Sentry) {
      Sentry.setUser({ id: sessionId });
    }
  }
  return sessionId;
}
```

---

## 🔍 PART 6: SEO & SOCIAL SHARING

### 6.1 Update HTML Meta Tags

**File:** `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Primary Meta Tags -->
    <title>ClueLadder - Daily Deduction Game</title>
    <meta name="title" content="ClueLadder - Daily Deduction Game" />
    <meta name="description" content="Deduce the answer through progressive hints. Three phases. One chance per phase. Play daily challenges or create custom puzzles." />
    <meta name="keywords" content="puzzle game, deduction game, daily challenge, guessing game, word game, trivia" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://clueladder.com/" />
    <meta property="og:title" content="ClueLadder - Daily Deduction Game" />
    <meta property="og:description" content="Deduce the answer through progressive hints. Three phases. One chance per phase." />
    <meta property="og:image" content="https://clueladder.com/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://clueladder.com/" />
    <meta property="twitter:title" content="ClueLadder - Daily Deduction Game" />
    <meta property="twitter:description" content="Deduce the answer through progressive hints. Three phases. One chance per phase." />
    <meta property="twitter:image" content="https://clueladder.com/twitter-image.png" />

    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="manifest" href="/site.webmanifest" />

    <!-- Canonical URL -->
    <link rel="canonical" href="https://clueladder.com/" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 6.2 Create Dynamic Meta Tags Component

**Create file:** `src/components/MetaTags.tsx`

```typescript
import { useEffect } from 'react';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function MetaTags({ title, description, image, url }: MetaTagsProps) {
  useEffect(() => {
    const defaultTitle = 'ClueLadder - Daily Deduction Game';
    const defaultDescription = 'Deduce the answer through progressive hints. Three phases. One chance per phase.';
    const defaultImage = 'https://clueladder.com/og-image.png';
    const defaultUrl = 'https://clueladder.com/';

    document.title = title || defaultTitle;

    // Update meta tags
    const metaTags = [
      { name: 'description', content: description || defaultDescription },
      { property: 'og:title', content: title || defaultTitle },
      { property: 'og:description', content: description || defaultDescription },
      { property: 'og:image', content: image || defaultImage },
      { property: 'og:url', content: url || defaultUrl },
      { property: 'twitter:title', content: title || defaultTitle },
      { property: 'twitter:description', content: description || defaultDescription },
      { property: 'twitter:image', content: image || defaultImage },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let element = document.querySelector(selector);

      if (!element) {
        element = document.createElement('meta');
        if (name) element.setAttribute('name', name);
        if (property) element.setAttribute('property', property);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    });
  }, [title, description, image, url]);

  return null;
}
```

### 6.3 Use MetaTags in PlayChallenge

**Update:** `src/pages/PlayChallenge.tsx`

```typescript
import MetaTags from '../components/MetaTags';

export default function PlayChallenge() {
  // ... existing code

  return (
    <>
      <MetaTags
        title={`Guess this ${challengeType}! - ClueLadder`}
        description="Can you solve this deduction challenge? Three phases of hints to help you guess the answer!"
        url={window.location.href}
      />
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 py-8 px-6">
        {/* ... existing JSX */}
      </div>
    </>
  );
}
```

---

## 🏆 PART 7: DAILY LEADERBOARD

### 7.1 Add Database Table

**Create file:** `supabase/migrations/20251104190000_add_daily_leaderboard.sql`

```sql
-- Daily Leaderboard Table
CREATE TABLE IF NOT EXISTS daily_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_date date NOT NULL,
  challenge_id text NOT NULL REFERENCES challenges(id),
  session_id text NOT NULL,
  rank text NOT NULL CHECK (rank IN ('Gold', 'Silver', 'Bronze')),
  solve_time_seconds integer NOT NULL,
  total_attempts integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(daily_date, session_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_leaderboard_date ON daily_leaderboard(daily_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_leaderboard_rank_time ON daily_leaderboard(daily_date, rank, solve_time_seconds ASC);

-- Enable RLS
ALTER TABLE daily_leaderboard ENABLE ROW LEVEL SECURITY;

-- Public can read leaderboard
CREATE POLICY "Public can view daily leaderboard"
  ON daily_leaderboard FOR SELECT
  TO public
  USING (true);

-- Anyone can insert their own score
CREATE POLICY "Anyone can insert leaderboard score"
  ON daily_leaderboard FOR INSERT
  TO public
  WITH CHECK (true);

-- Leaderboard view for easy querying
CREATE OR REPLACE VIEW daily_leaderboard_rankings AS
SELECT
  dl.daily_date,
  dl.session_id,
  dl.rank,
  dl.solve_time_seconds,
  dl.total_attempts,
  dl.created_at,
  ROW_NUMBER() OVER (
    PARTITION BY dl.daily_date
    ORDER BY
      CASE dl.rank
        WHEN 'Gold' THEN 1
        WHEN 'Silver' THEN 2
        WHEN 'Bronze' THEN 3
      END,
      dl.solve_time_seconds ASC,
      dl.created_at ASC
  ) as position
FROM daily_leaderboard dl
ORDER BY dl.daily_date DESC, position ASC;
```

### 7.2 Create Leaderboard Edge Function

**Create file:** `supabase/functions/get-daily-leaderboard/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://yourdomain.com", // REPLACE
];

function getCorsHeaders(origin: string | null) {
  const corsHeaders = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && allowedOrigins.includes(origin)) {
    return { ...corsHeaders, "Access-Control-Allow-Origin": origin };
  }
  return { ...corsHeaders, "Access-Control-Allow-Origin": allowedOrigins[0] };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];
    const limit = parseInt(url.searchParams.get("limit") || "100");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabase
      .from("daily_leaderboard_rankings")
      .select("*")
      .eq("daily_date", date)
      .limit(limit);

    if (error) throw error;

    return new Response(
      JSON.stringify({ date, leaderboard: data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### 7.3 Submit to Leaderboard on Daily Challenge Completion

**Update:** `src/pages/DailyChallenge.tsx`

```typescript
// After successful completion
if (data.result === 'correct') {
  const timeElapsed = Math.floor((Date.now() - startTime) / 1000);

  // Submit to daily leaderboard
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/submit-daily-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challenge_id: challengeId,
        session_id: getSessionId(),
        rank: phase === 1 ? 'Gold' : phase === 2 ? 'Silver' : 'Bronze',
        solve_time_seconds: timeElapsed,
        total_attempts: guesses + 1,
        daily_date: new Date().toISOString().split('T')[0],
      }),
    });
  } catch (err) {
    console.warn('Failed to submit leaderboard score:', err);
  }
}
```

### 7.4 Create Submit Score Edge Function

**Create file:** `supabase/functions/submit-daily-score/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = ["http://localhost:5173", "https://yourdomain.com"];

function getCorsHeaders(origin: string | null) {
  const corsHeaders = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (origin && allowedOrigins.includes(origin)) {
    return { ...corsHeaders, "Access-Control-Allow-Origin": origin };
  }
  return { ...corsHeaders, "Access-Control-Allow-Origin": allowedOrigins[0] };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { challenge_id, session_id, rank, solve_time_seconds, total_attempts, daily_date } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error } = await supabase.from("daily_leaderboard").insert({
      challenge_id,
      session_id,
      rank,
      solve_time_seconds,
      total_attempts,
      daily_date,
    });

    if (error) {
      // Ignore duplicate key errors (user already submitted)
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ message: "Score already submitted" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### 7.5 Display Daily Leaderboard Component

**Create file:** `src/components/DailyLeaderboard.tsx`

```typescript
import { useEffect, useState } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface LeaderboardEntry {
  session_id: string;
  rank: 'Gold' | 'Silver' | 'Bronze';
  solve_time_seconds: number;
  total_attempts: number;
  position: number;
}

export default function DailyLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/get-daily-leaderboard?date=${today}&limit=100`
        );
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Gold': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'Silver': return <Medal className="w-5 h-5 text-gray-400" />;
      case 'Bronze': return <Award className="w-5 h-5 text-orange-600" />;
      default: return null;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Gold': return 'bg-yellow-50 border-yellow-200';
      case 'Silver': return 'bg-gray-50 border-gray-200';
      case 'Bronze': return 'bg-orange-50 border-orange-200';
      default: return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scores Yet</h3>
        <p className="text-gray-600">Be the first to complete today's challenge!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900">Today's Leaderboard</h2>
      </div>

      <div className="space-y-2">
        {leaderboard.map((entry) => (
          <div
            key={entry.session_id}
            className={`flex items-center justify-between p-4 rounded-lg border-2 ${getRankColor(entry.rank)}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 text-center font-bold text-gray-700">
                #{entry.position}
              </div>
              {getRankIcon(entry.rank)}
              <div>
                <div className="font-medium text-gray-900">
                  Player {entry.session_id.slice(-6)}
                </div>
                <div className="text-sm text-gray-600">
                  {entry.total_attempts} {entry.total_attempts === 1 ? 'attempt' : 'attempts'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {Math.floor(entry.solve_time_seconds / 60)}:{String(entry.solve_time_seconds % 60).padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-500">Time</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📤 PART 8: SHAREABLE RESULT CARDS

### 8.1 Create Share Utility

**Create file:** `src/utils/shareResults.ts`

```typescript
export function generateShareText(
  rank: 'Gold' | 'Silver' | 'Bronze' | null,
  solved: boolean,
  guesses: number,
  phase: number,
  isDaily: boolean = false
): string {
  const date = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const rankEmoji = rank === 'Gold' ? '🥇' : rank === 'Silver' ? '🥈' : rank === 'Bronze' ? '🥉' : '❌';
  const phaseSquares = ['🟨', '🟧', '🟥'];
  const progressBar = phaseSquares.slice(0, phase).join('') + '⬜'.repeat(3 - phase);

  if (!solved) {
    return `🎯 ClueLadder ${isDaily ? date : 'Custom'}

❌ Unsolved
${progressBar}
${guesses} ${guesses === 1 ? 'guess' : 'guesses'}

Can you solve it?
${window.location.origin}`;
  }

  return `🎯 ClueLadder ${isDaily ? date : 'Custom'}

${rankEmoji} ${rank} Rank
${progressBar}
Phase ${phase} | ${guesses} ${guesses === 1 ? 'guess' : 'guesses'}

${window.location.origin}`;
}

export async function shareResults(
  rank: 'Gold' | 'Silver' | 'Bronze' | null,
  solved: boolean,
  guesses: number,
  phase: number,
  isDaily: boolean = false,
  shareUrl?: string
): Promise<boolean> {
  const shareText = generateShareText(rank, solved, guesses, phase, isDaily);

  // Try native share API first (mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'ClueLadder Results',
        text: shareText,
        url: shareUrl || window.location.origin,
      });
      return true;
    } catch (error) {
      // User cancelled or share failed, fall through to clipboard
      if (error instanceof Error && error.name !== 'AbortError') {
        console.warn('Share failed:', error);
      }
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(shareText);
    return true;
  } catch (error) {
    console.error('Copy failed:', error);
    return false;
  }
}
```

### 8.2 Update ShareCard Component

**Update file:** `src/components/ShareCard.tsx`

```typescript
import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { shareResults } from '../utils/shareResults';
import { trackEvent } from '../utils/tracking';

interface ShareCardProps {
  rank: 'Gold' | 'Silver' | 'Bronze' | null;
  solved: boolean;
  answer: string;
  guesses: number;
  shareUrl?: string;
  challengeId?: string;
  isDaily?: boolean;
  phase: number;
}

export default function ShareCard({
  rank,
  solved,
  answer,
  guesses,
  shareUrl,
  challengeId,
  isDaily = false,
  phase,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const success = await shareResults(rank, solved, guesses, phase, isDaily, shareUrl);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      if (challengeId) {
        await trackEvent('share', challengeId, {
          share_method: navigator.share ? 'native' : 'clipboard',
          rank,
          solved,
        });
      }
    }
  };

  const getRankColor = () => {
    if (!solved) return 'border-red-200 bg-red-50';
    switch (rank) {
      case 'Gold': return 'border-yellow-400 bg-yellow-50';
      case 'Silver': return 'border-gray-300 bg-gray-50';
      case 'Bronze': return 'border-orange-400 bg-orange-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getRankEmoji = () => {
    if (!solved) return '❌';
    switch (rank) {
      case 'Gold': return '🥇';
      case 'Silver': return '🥈';
      case 'Bronze': return '🥉';
      default: return '🎯';
    }
  };

  return (
    <div className={`rounded-2xl p-8 shadow-lg border-2 ${getRankColor()} space-y-6`}>
      <div className="text-center space-y-3">
        <div className="text-6xl">{getRankEmoji()}</div>
        <h2 className="text-3xl font-serif font-bold text-neutral-900">
          {solved ? `${rank} Rank!` : 'Better Luck Next Time'}
        </h2>
        <p className="text-xl text-neutral-700">
          The answer was: <span className="font-bold">{answer}</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 py-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-neutral-900">{phase}</div>
          <div className="text-sm text-neutral-600">Phase</div>
        </div>
        <div className="text-center border-x border-neutral-300">
          <div className="text-2xl font-bold text-neutral-900">{guesses}</div>
          <div className="text-sm text-neutral-600">Guesses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-neutral-900">
            {rank === 'Gold' ? '🥇' : rank === 'Silver' ? '🥈' : rank === 'Bronze' ? '🥉' : '—'}
          </div>
          <div className="text-sm text-neutral-600">Medal</div>
        </div>
      </div>

      <button
        onClick={handleShare}
        className="w-full px-6 py-4 bg-neutral-900 text-white rounded-full font-semibold text-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-3"
      >
        {copied ? (
          <>
            <Check size={20} />
            Copied!
          </>
        ) : (
          <>
            {navigator.share ? <Share2 size={20} /> : <Copy size={20} />}
            Share Results
          </>
        )}
      </button>

      {shareUrl && (
        <div className="text-center">
          <p className="text-sm text-neutral-600">Challenge your friends!</p>
        </div>
      )}
    </div>
  );
}
```

**Update PlayChallenge.tsx to pass phase:**

```typescript
<ShareCard
  rank={rank}
  solved={gameState === 'solved'}
  answer={answer}
  guesses={guesses}
  phase={phase}
  shareUrl={token ? window.location.href : undefined}
  challengeId={challengeId || undefined}
/>
```

---

## 🚩 PART 9: REPORT & MODERATION SYSTEM

### 9.1 Add Database Table

**Create file:** `supabase/migrations/20251104191000_add_reports.sql`

```sql
-- Challenge Reports Table
CREATE TABLE IF NOT EXISTS challenge_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id text NOT NULL REFERENCES challenges(id),
  reporter_session_id text NOT NULL,
  reason text NOT NULL CHECK (reason IN (
    'inappropriate',
    'offensive',
    'spam',
    'private_person',
    'inaccurate',
    'other'
  )),
  details text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'removed', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text
);

CREATE INDEX IF NOT EXISTS idx_reports_challenge ON challenge_reports(challenge_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON challenge_reports(status, created_at DESC);

-- Enable RLS
ALTER TABLE challenge_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can submit reports
CREATE POLICY "Anyone can submit reports"
  ON challenge_reports FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can view reports (for now, no one can read via RLS)
-- You'll need to add admin authentication later
```

### 9.2 Create Report Edge Function

**Create file:** `supabase/functions/report-challenge/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = ["http://localhost:5173", "https://yourdomain.com"];

function getCorsHeaders(origin: string | null) {
  const corsHeaders = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (origin && allowedOrigins.includes(origin)) {
    return { ...corsHeaders, "Access-Control-Allow-Origin": origin };
  }
  return { ...corsHeaders, "Access-Control-Allow-Origin": allowedOrigins[0] };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { challenge_id, session_id, reason, details } = await req.json();

    if (!challenge_id || !session_id || !reason) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validReasons = ['inappropriate', 'offensive', 'spam', 'private_person', 'inaccurate', 'other'];
    if (!validReasons.includes(reason)) {
      return new Response(
        JSON.stringify({ error: "Invalid reason" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user already reported this challenge
    const { data: existing } = await supabase
      .from("challenge_reports")
      .select("id")
      .eq("challenge_id", challenge_id)
      .eq("reporter_session_id", session_id)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ message: "You have already reported this challenge" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error } = await supabase.from("challenge_reports").insert({
      challenge_id,
      reporter_session_id: session_id,
      reason,
      details: details || null,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: "Report submitted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### 9.3 Create Report Button Component

**Create file:** `src/components/ReportButton.tsx`

```typescript
import { useState } from 'react';
import { Flag, X, Check } from 'lucide-react';
import { getSessionId } from '../utils/tracking';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface ReportButtonProps {
  challengeId: string;
}

export default function ReportButton({ challengeId }: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'offensive', label: 'Offensive or hateful' },
    { value: 'spam', label: 'Spam or misleading' },
    { value: 'private_person', label: 'Private individual' },
    { value: 'inaccurate', label: 'Inaccurate information' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/report-challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: challengeId,
          session_id: getSessionId(),
          reason: selectedReason,
          details: details || undefined,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitted(false);
          setSelectedReason('');
          setDetails('');
        }, 2000);
      }
    } catch (error) {
      console.error('Report failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-neutral-500 hover:text-neutral-700 flex items-center gap-1 transition-colors"
      >
        <Flag size={14} />
        Report
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-900">Report Challenge</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-neutral-900">Report submitted</p>
                <p className="text-sm text-neutral-600 mt-2">Thank you for helping keep ClueLadder safe</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-neutral-600">
                  Please select a reason for reporting this challenge:
                </p>

                <div className="space-y-2">
                  {reasons.map((reason) => (
                    <label
                      key={reason.value}
                      className="flex items-center gap-3 p-3 border-2 border-neutral-200 rounded-lg hover:border-neutral-300 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason.value}
                        checked={selectedReason === reason.value}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-neutral-900">{reason.label}</span>
                    </label>
                  ))}
                </div>

                <textarea
                  placeholder="Additional details (optional)"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-neutral-400 focus:outline-none resize-none"
                  rows={3}
                />

                <button
                  onClick={handleSubmit}
                  disabled={!selectedReason || submitting}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
```

### 9.4 Add Report Button to PlayChallenge

**Update:** `src/pages/PlayChallenge.tsx`

```typescript
import ReportButton from '../components/ReportButton';

// Add in the footer area after game ends:
{(gameState === 'solved' || gameState === 'failed') && challengeId && (
  <div className="text-center pt-4">
    <ReportButton challengeId={challengeId} />
  </div>
)}
```

---

## 🧪 PART 10: TESTING

### 10.1 Install Testing Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 10.2 Configure Vitest

**Create file:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

### 10.3 Create Test Setup

**Create file:** `src/test/setup.ts`

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

### 10.4 Add Test Scripts

**Update:** `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.app.json",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 10.5 Write Example Tests

**Create file:** `src/utils/tracking.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getSessionId } from './tracking';

describe('tracking utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getSessionId', () => {
    it('should generate a new session ID if none exists', () => {
      const sessionId = getSessionId();
      expect(sessionId).toMatch(/^session_[a-f0-9-]+$/);
    });

    it('should return the same session ID on subsequent calls', () => {
      const sessionId1 = getSessionId();
      const sessionId2 = getSessionId();
      expect(sessionId1).toBe(sessionId2);
    });

    it('should persist session ID in localStorage', () => {
      const sessionId = getSessionId();
      const stored = localStorage.getItem('clueladder_session_id');
      expect(stored).toBe(sessionId);
    });
  });
});
```

**Create file:** `src/utils/shareResults.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { generateShareText } from './shareResults';

describe('shareResults', () => {
  describe('generateShareText', () => {
    it('should generate correct text for Gold rank', () => {
      const text = generateShareText('Gold', true, 1, 1, false);
      expect(text).toContain('🥇 Gold Rank');
      expect(text).toContain('Phase 1');
      expect(text).toContain('1 guess');
    });

    it('should generate correct text for unsolved', () => {
      const text = generateShareText(null, false, 5, 2, false);
      expect(text).toContain('❌ Unsolved');
      expect(text).toContain('5 guesses');
    });

    it('should use plural for multiple guesses', () => {
      const text = generateShareText('Bronze', true, 7, 3, false);
      expect(text).toContain('7 guesses');
    });
  });
});
```

---

## 🚀 PART 11: CI/CD (GITHUB ACTIONS)

### 11.1 Create GitHub Actions Workflow

**Create file:** `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test & Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type checking
        run: npm run typecheck

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7

  deploy:
    name: Deploy to Production
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 11.2 Setup GitHub Secrets

Go to GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SENTRY_DSN`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

---

## 📚 PART 12: DOCUMENTATION

### 12.1 Update README

**Update file:** `README.md`

```markdown
# ClueLadder 🎯

A daily deduction game where players deduce the answer through progressive hints.

## Features

- **Daily Challenges** - New puzzle every day
- **Custom Challenges** - Create and share your own
- **Three Phases** - 5 words → 1 sentence → 5 categories
- **Leaderboards** - Compete with players worldwide
- **Analytics** - Comprehensive tracking and insights

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **AI:** OpenAI GPT-4 for validation & hint generation
- **Monitoring:** Sentry
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/clueladder.git
cd clueladder
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Add your environment variables to `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SENTRY_DSN=your_sentry_dsn
```

5. Run database migrations:
```bash
supabase db push
```

6. Start development server:
```bash
npm run dev
```

## Development

### Commands

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run typecheck` - Type checking
- `npm run lint` - Lint code

### Project Structure

```
src/
├── components/     # React components
├── pages/          # Page components
├── utils/          # Utility functions
├── test/           # Test files
└── main.tsx        # Entry point

supabase/
├── functions/      # Edge functions
└── migrations/     # Database migrations
```

## Deployment

### Vercel (Frontend)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

### Supabase (Backend)

1. Deploy edge functions:
```bash
supabase functions deploy
```

2. Set environment variables in Supabase dashboard

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [docs.clueladder.com](https://docs.clueladder.com)
- Issues: [GitHub Issues](https://github.com/yourusername/clueladder/issues)
- Email: support@clueladder.com
```

---

## ♿ PART 13: ACCESSIBILITY

### 13.1 Add ARIA Labels to Components

**Update:** `src/components/GuessBar.tsx`

```typescript
<form onSubmit={handleSubmit} className="flex gap-2">
  <input
    type="text"
    value={guess}
    onChange={(e) => setGuess(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    aria-label="Your guess"
    aria-required="true"
    className="flex-1 px-6 py-4 text-lg border-2 border-neutral-300 rounded-full focus:border-gold focus:outline-none disabled:opacity-50"
  />
  <button
    type="submit"
    disabled={!guess.trim() || disabled}
    aria-label="Submit guess"
    className="px-8 py-4 bg-neutral-900 text-white rounded-full font-semibold hover:bg-gold hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    Guess
  </button>
</form>
```

**Update:** `src/components/PhaseChips.tsx`

```typescript
<div
  className="flex flex-wrap justify-center gap-3"
  role="list"
  aria-label="Phase 1 hint words"
>
  {words.map((word, index) => (
    <div
      key={index}
      role="listitem"
      className={`px-6 py-3 rounded-full text-lg font-medium transition-all ${
        revealed
          ? 'bg-gold text-neutral-900 shadow-md'
          : 'bg-neutral-200 text-neutral-500'
      }`}
    >
      {revealed ? word : '?????'}
    </div>
  ))}
</div>
```

### 13.2 Add Skip Navigation

**Update:** `src/App.tsx`

```typescript
function App() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold focus:text-neutral-900 focus:rounded-lg"
      >
        Skip to main content
      </a>
      <BrowserRouter>
        <main id="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/daily" element={<DailyChallenge />} />
            <Route path="/create" element={<CreateChallenge />} />
            <Route path="/play" element={<PlayChallenge />} />
          </Routes>
        </main>
      </BrowserRouter>
    </>
  );
}
```

### 13.3 Add Screen Reader Utilities to Tailwind

**Update:** `tailwind.config.js`

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#f59e0b',
      },
    },
  },
  plugins: [
    // Screen reader only class
    function ({ addUtilities }) {
      addUtilities({
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        },
        '.not-sr-only': {
          position: 'static',
          width: 'auto',
          height: 'auto',
          padding: '0',
          margin: '0',
          overflow: 'visible',
          clip: 'auto',
          whiteSpace: 'normal',
        },
      });
    },
  ],
};
```

---

## 💰 PART 14: MONETIZATION (ADS ONLY)

### 14.1 Google AdSense Integration

**Create file:** `src/components/AdBanner.tsx`

```typescript
import { useEffect } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  className?: string;
}

export default function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  className = ''
}: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('Ad failed to load:', error);
    }
  }, []);

  // Only show ads in production
  if (import.meta.env.DEV) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center ${className}`}>
        <p className="text-sm text-gray-600">Ad Placement</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}
```

### 14.2 Add AdSense Script to HTML

**Update:** `index.html`

```html
<head>
  <!-- ... existing meta tags ... -->

  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
</head>
```

### 14.3 Add Ads to Pages (Non-Intrusive)

**Update:** `src/pages/Home.tsx`

```typescript
import AdBanner from '../components/AdBanner';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-12">
        {/* ... existing content ... */}

        {/* Ad placement at bottom */}
        <AdBanner
          slot="1234567890"
          format="auto"
          className="max-w-xl mx-auto"
        />
      </div>
    </div>
  );
}
```

**Add to PlayChallenge after completion:**

```typescript
{(gameState === 'solved' || gameState === 'failed') && (
  <>
    <ShareCard ... />
    <AdBanner slot="0987654321" className="max-w-xl mx-auto" />
    {challengeId && <Leaderboard challengeId={challengeId} />}
  </>
)}
```

---

## 🔐 PART 15: COST OPTIMIZATION FOR OPENAI

### 15.1 Add Response Caching

**Create database table:**

```sql
-- API Response Cache
CREATE TABLE IF NOT EXISTS api_cache (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON api_cache(expires_at);

-- Enable RLS
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;

-- Cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM api_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

### 15.2 Update validate-challenge to Use Cache

**Update:** `supabase/functions/validate-challenge/index.ts`

Add caching logic:

```typescript
// At the top, after imports
async function getCachedResponse(supabase: any, key: string) {
  const { data } = await supabase
    .from('api_cache')
    .select('value')
    .eq('key', key)
    .gt('expires_at', new Date().toISOString())
    .single();

  return data?.value || null;
}

async function setCachedResponse(supabase: any, key: string, value: any, ttlHours: number = 24) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);

  await supabase.from('api_cache').upsert({
    key,
    value,
    expires_at: expiresAt.toISOString(),
  });
}

// In the main handler, before OpenAI calls:
const cacheKey = `validation:${type}:${target.toLowerCase()}`;
const cached = await getCachedResponse(supabase, cacheKey);

if (cached) {
  return new Response(
    JSON.stringify(cached),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ... make OpenAI calls ...

// After successful response, cache it:
const responseData = {
  challenge_id: challengeId,
  type,
  target,
  fame_score: validationResult.fame_score,
  phase1_options: hints.phase1_options,
  phase2_options: hints.phase2_options,
  phase3: hints.phase3,
  aliases: hints.aliases || [target],
};

await setCachedResponse(supabase, cacheKey, responseData, 168); // Cache for 1 week

return new Response(
  JSON.stringify(responseData),
  { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
);
```

### 15.3 Monitor OpenAI Usage

**Create file:** `supabase/functions/_shared/ai-usage-tracker.ts`

```typescript
import { createClient } from "npm:@supabase/supabase-js@2";

export async function trackAIUsage(
  endpoint: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  cached: boolean = false
) {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabase.from("ai_usage_log").insert({
      endpoint,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cached,
      estimated_cost: calculateCost(model, inputTokens, outputTokens),
    });
  } catch (error) {
    console.error("Failed to track AI usage:", error);
  }
}

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  // OpenAI pricing (as of 2025)
  const prices: Record<string, { input: number; output: number }> = {
    "gpt-4o": { input: 0.0025 / 1000, output: 0.010 / 1000 },
    "gpt-4o-mini": { input: 0.00015 / 1000, output: 0.0006 / 1000 },
  };

  const pricing = prices[model] || prices["gpt-4o-mini"];
  return (inputTokens * pricing.input) + (outputTokens * pricing.output);
}
```

**Add usage log table:**

```sql
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  model text NOT NULL,
  input_tokens integer NOT NULL,
  output_tokens integer NOT NULL,
  cached boolean DEFAULT false,
  estimated_cost numeric(10, 6),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ai_usage_created ON ai_usage_log(created_at DESC);
```

---

## ✅ FINAL CHECKLIST

Before deploying to production, ensure:

### Security
- [ ] CORS updated to specific domains
- [ ] Rate limiting implemented on all AI endpoints
- [ ] Environment variables validated
- [ ] RLS policies reviewed
- [ ] Report system functional

### Performance
- [ ] Response caching implemented
- [ ] Tracking is fire-and-forget
- [ ] Progress persistence working
- [ ] AI usage monitoring active

### User Experience
- [ ] Error boundaries catch all errors
- [ ] Sentry capturing production errors
- [ ] Meta tags for SEO/social sharing
- [ ] Accessibility labels added
- [ ] Share cards generate correctly

### Features
- [ ] Daily leaderboard displaying
- [ ] Reports submitting successfully
- [ ] Ads displaying (if approved)
- [ ] All tracking events firing

### DevOps
- [ ] Tests passing
- [ ] GitHub Actions workflow runs
- [ ] Build completes successfully
- [ ] Deployment to Vercel works
- [ ] Edge functions deployed to Supabase

---

## 🚀 DEPLOYMENT STEPS

### 1. Deploy Database Changes

```bash
supabase db push
```

### 2. Deploy Edge Functions

```bash
supabase functions deploy validate-challenge
supabase functions deploy check-guess
supabase functions deploy track-event
supabase functions deploy get-leaderboard
supabase functions deploy get-daily-leaderboard
supabase functions deploy submit-daily-score
supabase functions deploy report-challenge
supabase functions deploy finalize-challenge
supabase functions deploy log-preview
supabase functions deploy resolve-challenge
supabase functions deploy daily-challenge
```

### 3. Set Environment Variables in Supabase

```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set CHALLENGE_SIGNING_SECRET=your_secret
supabase secrets set UPSTASH_REDIS_REST_URL=https://...
supabase secrets set UPSTASH_REDIS_REST_TOKEN=...
```

### 4. Deploy Frontend to Vercel

```bash
vercel --prod
```

### 5. Configure Environment Variables in Vercel

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_SENTRY_DSN
- VITE_ADSENSE_CLIENT_ID

### 6. Test Production

- [ ] Create a challenge
- [ ] Play a challenge
- [ ] Submit to leaderboard
- [ ] Share results
- [ ] Report a challenge
- [ ] Check Sentry for errors
- [ ] Verify tracking in Supabase

---

## 📞 SUPPORT

If you encounter issues during implementation:

1. Check error messages in browser console
2. Check Supabase logs for edge function errors
3. Check Sentry dashboard for production errors
4. Review this document for missed steps

---

## 🎉 YOU'RE DONE!

Once all items are checked off, your ClueLadder game is production-ready with:

✅ Enterprise-grade security
✅ High performance with caching
✅ Full error monitoring
✅ Comprehensive analytics
✅ User engagement features
✅ Monetization capability
✅ Automated testing & deployment

**Good luck with your launch! 🚀**
