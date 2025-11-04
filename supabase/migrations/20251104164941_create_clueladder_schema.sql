/*
  # ClueLadder Database Schema

  1. New Tables
    - `challenges`
      - `id` (text, primary key) - unique challenge identifier
      - `type` (text) - person, place, or thing
      - `target` (text) - the answer to guess
      - `fame_score` (int) - AI-determined fame score (0-5)
      - `created_at` (timestamptz) - creation timestamp
      - `expires_at` (timestamptz) - when the challenge link expires
      
    - `daily_challenges`
      - `id` (uuid, primary key)
      - `challenge_date` (date) - the date this challenge is for
      - `challenge_id` (text) - references challenges(id)
      - `created_at` (timestamptz)
      
    - `plays`
      - `id` (uuid, primary key)
      - `challenge_id` (text) - references challenges(id)
      - `player_fingerprint` (text) - anonymous player identifier
      - `phase_reached` (int) - highest phase reached (1, 2, or 3)
      - `solved` (boolean) - whether player solved it
      - `guesses_used` (int) - number of guesses made
      - `rank` (text) - Gold, Silver, or Bronze
      - `created_at` (timestamptz)
      
    - `events`
      - `id` (uuid, primary key)
      - `challenge_id` (text) - references challenges(id)
      - `kind` (text) - event type (view, guess, reveal_phase2, pick_category)
      - `meta` (jsonb) - additional event data
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Backend-only write access via service role
    - Public read access for resolved challenges only
*/

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('person', 'place', 'thing')),
  target text NOT NULL,
  fame_score int CHECK (fame_score >= 0 AND fame_score <= 5),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Create daily_challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date NOT NULL UNIQUE,
  challenge_id text NOT NULL REFERENCES challenges(id),
  created_at timestamptz DEFAULT now()
);

-- Create plays table
CREATE TABLE IF NOT EXISTS plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id text REFERENCES challenges(id),
  player_fingerprint text,
  phase_reached int CHECK (phase_reached >= 1 AND phase_reached <= 3),
  solved boolean DEFAULT false,
  guesses_used int DEFAULT 0,
  rank text CHECK (rank IN ('Gold', 'Silver', 'Bronze')),
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id text,
  kind text NOT NULL,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON challenges(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_plays_challenge_id ON plays(challenge_id);
CREATE INDEX IF NOT EXISTS idx_events_challenge_id ON events(challenge_id);

-- Enable Row Level Security
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Backend writes only, public reads for analytics
CREATE POLICY "Public can read challenges"
  ON challenges FOR SELECT
  USING (true);

CREATE POLICY "Public can read daily challenges"
  ON daily_challenges FOR SELECT
  USING (true);

CREATE POLICY "Public can read plays for stats"
  ON plays FOR SELECT
  USING (true);

CREATE POLICY "Public can read events for analytics"
  ON events FOR SELECT
  USING (true);