# Comprehensive Analytics & Tracking System

## Overview

I've built a complete analytics and tracking system for your challenge game. Here's everything that's now trackable:

## What's Tracked

### 1. Challenge Creation & Previews
- **Every input** users type when creating challenges (even if abandoned)
- All 3 variations generated for 5 words hint
- All 3 variations generated for sentence hint
- Which specific options they selected (0, 1, or 2)
- Whether they finalized and shared the challenge
- Session ID to track individual creators

**Table:** `challenge_previews`

### 2. Challenge Attempts (Every Guess)
- Exact text of every guess submitted
- Which phase they were on when they guessed (1, 2, or 3)
- Whether the guess was correct
- Timestamp of each attempt
- Session ID for anonymous tracking

**Table:** `challenge_attempts`

### 3. Challenge Completions
- Which phase they solved it on (1, 2, or 3)
- Total number of attempts before correct answer
- Time taken to complete (in seconds)
- One entry per user per challenge

**Table:** `challenge_completions`

### 4. Unique Visitors
- Tracks each unique person who opens a challenge
- Referrer information (how they found it)
- First visit timestamp
- Prevents duplicate counting

**Table:** `challenge_visitors`

### 5. Share Tracking
- Every time someone clicks the share/copy button
- Who shared it (session ID)
- Share method (clipboard, social media, etc.)
- Timestamp

**Table:** `challenge_shares`

### 6. Challenge Metadata
- Is it a daily challenge or custom
- Creator session ID
- Which difficulty options they selected
- **Denormalized counters for fast queries:**
  - Total view count
  - Total completions
  - Total shares

**Table:** `challenge_metadata`

## Viral Tracking & Influencer Analytics

### How It Works

When an influencer creates a challenge:
1. Their `session_id` is stored as `creator_session_id`
2. Every person who opens their challenge is tracked in `challenge_visitors`
3. Every share is linked back to the original `challenge_id`
4. Real-time counters update via database triggers

### Identifying Top Influencers

Query the `top_creators_view` to see:
- Total challenges created
- Total views across all their challenges
- Total completions
- Total shares
- Average views per challenge
- Most viral challenge they've created

**Example scenario:**
If an influencer's challenge gets shared to 30,000 people:
- `challenge_visitors`: 30,000 unique session_id entries
- `challenge_metadata.view_count`: Updates to 30,000
- `challenge_shares`: Tracks each individual share event
- `top_creators_view`: Shows this creator at the top

## Public Leaderboard Data

### Available via `challenge_leaderboard_view`

For each challenge, you can display:
- Total unique visitors
- Total completions
- Completion rate (% who solved it)
- How many solved after seeing categories only (Gold), categories + sentence (Silver), or all hints (Bronze)
- Average number of attempts
- Average time to complete
- Total shares

This data is **public** and can be shown to anyone without authentication.

## Edge Functions Created

### 1. `log-preview`
**POST** `/functions/v1/log-preview`

Logs when someone generates challenge options (even if not finalized).

```json
{
  "type": "person",
  "target_input": "Albert Einstein",
  "generated_phase1_options": [[...], [...], [...]],
  "generated_phase2_options": [...],
  "generated_phase3": {...},
  "generated_aliases": [...],
  "session_id": "anonymous-session-123"
}
```

Returns: `{ "preview_id": "uuid" }`

### 2. `finalize-challenge` (Updated)
**POST** `/functions/v1/finalize-challenge`

Now includes tracking metadata:

```json
{
  "challenge_id": "...",
  "type": "person",
  "target": "Albert Einstein",
  "phase1": ["..."],
  "phase2": "...",
  "phase3": {...},
  "aliases": [...],
  "session_id": "anonymous-session-123",
  "preview_id": "optional-uuid",
  "selected_phase1_index": 0,
  "selected_phase2_index": 1
}
```

###  3. `track-event`
**POST** `/functions/v1/track-event`

Universal tracking endpoint for all events:

**Visit:**
```json
{
  "event_type": "visit",
  "challenge_id": "...",
  "session_id": "...",
  "data": {
    "referrer": "twitter.com"
  }
}
```

**Attempt:**
```json
{
  "event_type": "attempt",
  "challenge_id": "...",
  "session_id": "...",
  "data": {
    "guess_text": "albert einstein",
    "phase_revealed": 2,
    "is_correct": false
  }
}
```

**Completion:**
```json
{
  "event_type": "completion",
  "challenge_id": "...",
  "session_id": "...",
  "data": {
    "completed_phase": 2,
    "total_attempts": 5,
    "time_taken_seconds": 120
  }
}
```

**Share:**
```json
{
  "event_type": "share",
  "challenge_id": "...",
  "session_id": "...",
  "data": {
    "share_method": "clipboard"
  }
}
```

### 4. `get-leaderboard`
**GET** `/functions/v1/get-leaderboard?challenge_id=...`

Returns comprehensive stats for display:

```json
{
  "challenge_id": "...",
  "type": "person",
  "is_daily": false,
  "unique_visitors": 30000,
  "unique_completions": 12500,
  "phase1_completions": 200,
  "phase2_completions": 5300,
  "phase3_completions": 7000,
  "avg_attempts": 3.5,
  "avg_time_seconds": 145.2,
  "completion_rate_percent": 41.67,
  "view_count": 30000,
  "completion_count": 12500,
  "share_count": 2500
}
```

## Database Schema

```sql
-- Preview Tracking
challenge_previews (
  id uuid PRIMARY KEY,
  type text,
  target_input text,
  generated_phase1_options jsonb,
  generated_phase2_options jsonb,
  generated_phase3 jsonb,
  selected_phase1_index integer,
  selected_phase2_index integer,
  finalized boolean,
  challenge_id text,
  session_id text,
  created_at timestamptz
)

-- Attempt Tracking
challenge_attempts (
  id uuid PRIMARY KEY,
  challenge_id text,
  session_id text,
  guess_text text,
  phase_revealed integer,
  is_correct boolean,
  attempted_at timestamptz
)

-- Completion Tracking
challenge_completions (
  id uuid PRIMARY KEY,
  challenge_id text,
  session_id text,
  completed_phase integer,
  total_attempts integer,
  time_taken_seconds integer,
  completed_at timestamptz,
  UNIQUE(challenge_id, session_id)
)

-- Visitor Tracking
challenge_visitors (
  id uuid PRIMARY KEY,
  challenge_id text,
  session_id text,
  referrer text,
  first_visit_at timestamptz,
  UNIQUE(challenge_id, session_id)
)

-- Share Tracking
challenge_shares (
  id uuid PRIMARY KEY,
  challenge_id text,
  sharer_session_id text,
  share_method text,
  shared_at timestamptz
)

-- Metadata & Counters
challenge_metadata (
  challenge_id text PRIMARY KEY,
  is_daily boolean,
  daily_date date,
  creator_session_id text,
  selected_phase1_index integer,
  selected_phase2_index integer,
  view_count integer DEFAULT 0,
  completion_count integer DEFAULT 0,
  share_count integer DEFAULT 0
)
```

## Security & Privacy

- All tracking uses anonymous `session_id` (no PII)
- RLS enabled on all tables
- Public can only read leaderboard data
- Insert-only access for tracking events
- No update/delete allowed (data integrity)

## Performance Optimizations

1. **Denormalized Counters**: Fast queries without aggregation
2. **Database Triggers**: Auto-update counters on insert
3. **Indexes**: Optimized for common query patterns
4. **Views**: Pre-computed leaderboard aggregations

## Next Steps to Complete

To fully integrate this system, you'll need to:

1. **Frontend Integration:**
   - Generate/store session_id in localStorage
   - Call `log-preview` when challenge options are generated
   - Call `track-event` for visits, attempts, completions, shares
   - Update `CreateChallenge.tsx` to pass session_id and preview_id
   - Display leaderboard on challenge completion

2. **Deploy Edge Functions:**
   - Deploy `log-preview`, `track-event`, `get-leaderboard`
   - Re-deploy `finalize-challenge` with new parameters

3. **Build Leaderboard UI:**
   - Create component to fetch and display leaderboard data
   - Show stats after completing a challenge
   - Make it shareable

4. **Admin Dashboard** (Future):
   - Query `top_creators_view` for influencer insights
   - Build analytics dashboard
   - Track trends over time

## Query Examples

### Find Top 10 Viral Creators
```sql
SELECT * FROM top_creators_view
ORDER BY total_views DESC
LIMIT 10;
```

### Get All Guesses for a Challenge
```sql
SELECT
  guess_text,
  phase_revealed,
  is_correct,
  attempted_at
FROM challenge_attempts
WHERE challenge_id = 'your-challenge-id'
ORDER BY attempted_at ASC;
```

### Daily Challenge Performance
```sql
SELECT
  daily_date,
  view_count,
  completion_count,
  ROUND(100.0 * completion_count / NULLIF(view_count, 0), 2) as completion_rate
FROM challenge_metadata
WHERE is_daily = true
ORDER BY daily_date DESC;
```

### Most Popular Targets
```sql
SELECT
  c.target,
  c.type,
  cm.view_count,
  cm.completion_count
FROM challenges c
JOIN challenge_metadata cm ON c.id = cm.challenge_id
WHERE cm.is_daily = false
ORDER BY cm.view_count DESC
LIMIT 20;
```

---

## Summary

You now have **complete visibility** into:
- What people type (even failed attempts)
- What gets generated (all 3 difficulty options)
- What gets shared (which options selected)
- Who's playing (unique visitors)
- How they play (every guess attempt)
- Success metrics (completion rates by phase)
- Viral growth (who's sharing, how much spread)
- Creator insights (top influencers by views/shares)

All data is anonymous, secure, performant, and ready to power dashboards, leaderboards, and business insights!
