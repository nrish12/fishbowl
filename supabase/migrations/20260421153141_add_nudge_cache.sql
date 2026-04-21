/*
  # AI Nudge Response Cache

  1. New Table
    - `nudge_cache`
      - `id` (uuid, primary key)
      - `challenge_id` (uuid) — which challenge the nudge belongs to
      - `phase` (text) — "phase4" or "phase5"
      - `guesses_hash` (text) — deterministic hash of sorted lower-cased wrong guesses
      - `response` (jsonb) — full JSON response to return to callers on cache hit
      - `created_at` (timestamptz)
      - UNIQUE (challenge_id, phase, guesses_hash)
  
  2. Purpose
    - When two players hit phase 4/5 with the same set of wrong guesses for the same
      challenge, we serve a cached response instead of calling OpenAI again.
    - Cuts latency (cache hit is < 50ms vs 3-5s OpenAI call).
    - Cuts OpenAI cost for popular daily puzzles.
  
  3. Security
    - RLS enabled with NO policies → only service_role (edge functions) can access.
    - Edge functions use service role key, frontend cannot read/write this table.
  
  4. Notes
    - Uses upsert (on conflict do nothing) so concurrent writes don't crash.
    - guesses_hash is deterministic: sort + lowercase + trim + join with '|' + sha256.
*/

CREATE TABLE IF NOT EXISTS nudge_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL,
  phase text NOT NULL,
  guesses_hash text NOT NULL,
  response jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT nudge_cache_phase_check CHECK (phase IN ('phase4', 'phase5')),
  CONSTRAINT nudge_cache_unique UNIQUE (challenge_id, phase, guesses_hash)
);

CREATE INDEX IF NOT EXISTS idx_nudge_cache_lookup
  ON nudge_cache (challenge_id, phase, guesses_hash);

ALTER TABLE nudge_cache ENABLE ROW LEVEL SECURITY;
