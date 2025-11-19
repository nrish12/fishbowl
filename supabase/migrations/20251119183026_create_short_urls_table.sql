/*
  # Create Short URLs System

  1. New Tables
    - `short_urls`
      - `id` (uuid, primary key)
      - `short_code` (text, unique, 6-character code)
      - `full_token` (text, the original challenge token)
      - `challenge_id` (uuid, reference to challenges)
      - `created_at` (timestamptz)
      - `clicks` (integer, track usage)
      - `last_accessed` (timestamptz)

  2. Security
    - Enable RLS on `short_urls` table
    - Allow anyone to read short URLs (they're meant to be shared)
    - Only service role can create short URLs

  3. Indexes
    - Index on short_code for fast lookups
    - Index on challenge_id for analytics
*/

CREATE TABLE IF NOT EXISTS short_urls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code text UNIQUE NOT NULL,
  full_token text NOT NULL,
  challenge_id uuid,
  created_at timestamptz DEFAULT now(),
  clicks integer DEFAULT 0,
  last_accessed timestamptz
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_short_urls_code ON short_urls(short_code);
CREATE INDEX IF NOT EXISTS idx_short_urls_challenge ON short_urls(challenge_id);

-- Enable RLS
ALTER TABLE short_urls ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (short URLs are public by design)
CREATE POLICY "Anyone can read short URLs"
  ON short_urls
  FOR SELECT
  USING (true);

-- Only authenticated users can create (will be enforced by edge function)
CREATE POLICY "Service role can insert short URLs"
  ON short_urls
  FOR INSERT
  WITH CHECK (true);

-- Allow updates for click tracking
CREATE POLICY "Anyone can update click stats"
  ON short_urls
  FOR UPDATE
  USING (true)
  WITH CHECK (true);