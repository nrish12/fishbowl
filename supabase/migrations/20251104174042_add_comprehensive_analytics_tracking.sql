/*
  # Comprehensive Analytics and Tracking System

  ## Overview
  This migration adds complete tracking capabilities for:
  - Preview attempts and generated content
  - Challenge completions and guess attempts
  - Sharing analytics and viral tracking
  - Public leaderboards and statistics

  ## New Tables

  ### 1. `challenge_previews`
  Tracks every challenge creation attempt, even if abandoned
  
  ### 2. `challenge_attempts`
  Tracks every single guess attempt
  
  ### 3. `challenge_completions`
  Tracks successful completions
  
  ### 4. `challenge_shares`
  Tracks every share button click
  
  ### 5. `challenge_visitors`
  Tracks unique visitors to each challenge
  
  ### 6. `challenge_metadata`
  Extended metadata for challenges

  ## Security
  - Enable RLS on all tables
  - Public read access to leaderboard data
  - Insert-only access for tracking events
*/

-- Challenge Previews (track all creation attempts)
CREATE TABLE IF NOT EXISTS challenge_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('person', 'place', 'thing')),
  target_input text NOT NULL,
  generated_phase1_options jsonb NOT NULL,
  generated_phase2_options jsonb NOT NULL,
  generated_phase3 jsonb NOT NULL,
  generated_aliases jsonb,
  selected_phase1_index integer CHECK (selected_phase1_index IN (0, 1, 2)),
  selected_phase2_index integer CHECK (selected_phase2_index IN (0, 1, 2)),
  finalized boolean DEFAULT false,
  challenge_id text REFERENCES challenges(id),
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenge_previews_session ON challenge_previews(session_id);
CREATE INDEX IF NOT EXISTS idx_challenge_previews_finalized ON challenge_previews(finalized);
CREATE INDEX IF NOT EXISTS idx_challenge_previews_created_at ON challenge_previews(created_at DESC);

-- Challenge Attempts (every guess)
CREATE TABLE IF NOT EXISTS challenge_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id text NOT NULL REFERENCES challenges(id),
  session_id text NOT NULL,
  guess_text text NOT NULL,
  phase_revealed integer NOT NULL CHECK (phase_revealed IN (1, 2, 3)),
  is_correct boolean DEFAULT false,
  attempted_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenge_attempts_challenge ON challenge_attempts(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_session ON challenge_attempts(session_id, challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_attempted_at ON challenge_attempts(attempted_at DESC);

-- Challenge Completions (successful solves)
CREATE TABLE IF NOT EXISTS challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id text NOT NULL REFERENCES challenges(id),
  session_id text NOT NULL,
  completed_phase integer NOT NULL CHECK (completed_phase IN (1, 2, 3)),
  total_attempts integer NOT NULL DEFAULT 1,
  time_taken_seconds integer,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_completions_challenge ON challenge_completions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_completed_at ON challenge_completions(completed_at DESC);

-- Challenge Shares (track sharing)
CREATE TABLE IF NOT EXISTS challenge_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id text NOT NULL REFERENCES challenges(id),
  sharer_session_id text NOT NULL,
  share_method text DEFAULT 'clipboard',
  shared_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenge_shares_challenge ON challenge_shares(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_shares_sharer ON challenge_shares(sharer_session_id);
CREATE INDEX IF NOT EXISTS idx_challenge_shares_shared_at ON challenge_shares(shared_at DESC);

-- Challenge Visitors (unique visitors)
CREATE TABLE IF NOT EXISTS challenge_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id text NOT NULL REFERENCES challenges(id),
  session_id text NOT NULL,
  referrer text,
  first_visit_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_visitors_challenge ON challenge_visitors(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_visitors_first_visit ON challenge_visitors(first_visit_at DESC);

-- Challenge Metadata (extended info)
CREATE TABLE IF NOT EXISTS challenge_metadata (
  challenge_id text PRIMARY KEY REFERENCES challenges(id),
  is_daily boolean DEFAULT false,
  daily_date date,
  creator_session_id text,
  selected_phase1_index integer CHECK (selected_phase1_index IN (0, 1, 2)),
  selected_phase2_index integer CHECK (selected_phase2_index IN (0, 1, 2)),
  view_count integer DEFAULT 0,
  completion_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenge_metadata_daily ON challenge_metadata(is_daily, daily_date);
CREATE INDEX IF NOT EXISTS idx_challenge_metadata_creator ON challenge_metadata(creator_session_id);
CREATE INDEX IF NOT EXISTS idx_challenge_metadata_view_count ON challenge_metadata(view_count DESC);

-- Leaderboard View (public stats per challenge)
CREATE OR REPLACE VIEW challenge_leaderboard_view AS
SELECT 
  c.id as challenge_id,
  c.type,
  cm.is_daily,
  cm.view_count,
  cm.completion_count,
  cm.share_count,
  COUNT(DISTINCT cv.session_id) as unique_visitors,
  COUNT(DISTINCT cc.session_id) as unique_completions,
  COUNT(DISTINCT CASE WHEN cc.completed_phase = 1 THEN cc.session_id END) as phase1_completions,
  COUNT(DISTINCT CASE WHEN cc.completed_phase = 2 THEN cc.session_id END) as phase2_completions,
  COUNT(DISTINCT CASE WHEN cc.completed_phase = 3 THEN cc.session_id END) as phase3_completions,
  ROUND(AVG(cc.total_attempts), 2) as avg_attempts,
  ROUND(AVG(cc.time_taken_seconds), 2) as avg_time_seconds,
  CASE 
    WHEN COUNT(DISTINCT cv.session_id) > 0 
    THEN ROUND(100.0 * COUNT(DISTINCT cc.session_id) / COUNT(DISTINCT cv.session_id), 2)
    ELSE 0 
  END as completion_rate_percent
FROM challenges c
LEFT JOIN challenge_metadata cm ON c.id = cm.challenge_id
LEFT JOIN challenge_visitors cv ON c.id = cv.challenge_id
LEFT JOIN challenge_completions cc ON c.id = cc.challenge_id
GROUP BY c.id, c.type, cm.is_daily, cm.view_count, cm.completion_count, cm.share_count;

-- Top Creators View (viral challenge creators)
CREATE OR REPLACE VIEW top_creators_view AS
SELECT 
  cm.creator_session_id,
  COUNT(DISTINCT cm.challenge_id) as challenges_created,
  SUM(cm.view_count) as total_views,
  SUM(cm.completion_count) as total_completions,
  SUM(cm.share_count) as total_shares,
  ROUND(AVG(cm.view_count), 2) as avg_views_per_challenge,
  MAX(cm.view_count) as most_viral_challenge_views
FROM challenge_metadata cm
WHERE cm.creator_session_id IS NOT NULL
GROUP BY cm.creator_session_id
ORDER BY total_views DESC;

-- Enable RLS on all tables
ALTER TABLE challenge_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_metadata ENABLE ROW LEVEL SECURITY;

-- Public read access to leaderboard data
CREATE POLICY "Public can view challenge metadata"
  ON challenge_metadata FOR SELECT
  TO public
  USING (true);

-- Anyone can insert tracking events (anonymous)
CREATE POLICY "Anyone can log preview attempts"
  ON challenge_previews FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can log guess attempts"
  ON challenge_attempts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can log completions"
  ON challenge_completions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can log shares"
  ON challenge_shares FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can log visits"
  ON challenge_visitors FOR INSERT
  TO public
  WITH CHECK (true);

-- Users can read their own preview attempts
CREATE POLICY "Users can view own previews"
  ON challenge_previews FOR SELECT
  TO public
  USING (true);

-- Function to update denormalized counters
CREATE OR REPLACE FUNCTION update_challenge_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'challenge_visitors' THEN
    UPDATE challenge_metadata 
    SET view_count = view_count + 1 
    WHERE challenge_id = NEW.challenge_id;
  ELSIF TG_TABLE_NAME = 'challenge_completions' THEN
    UPDATE challenge_metadata 
    SET completion_count = completion_count + 1 
    WHERE challenge_id = NEW.challenge_id;
  ELSIF TG_TABLE_NAME = 'challenge_shares' THEN
    UPDATE challenge_metadata 
    SET share_count = share_count + 1 
    WHERE challenge_id = NEW.challenge_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to maintain counters
DROP TRIGGER IF EXISTS trigger_update_view_count ON challenge_visitors;
CREATE TRIGGER trigger_update_view_count
  AFTER INSERT ON challenge_visitors
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_counters();

DROP TRIGGER IF EXISTS trigger_update_completion_count ON challenge_completions;
CREATE TRIGGER trigger_update_completion_count
  AFTER INSERT ON challenge_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_counters();

DROP TRIGGER IF EXISTS trigger_update_share_count ON challenge_shares;
CREATE TRIGGER trigger_update_share_count
  AFTER INSERT ON challenge_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_counters();
