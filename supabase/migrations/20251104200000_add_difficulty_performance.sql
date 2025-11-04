/*
  # Add Difficulty Performance Tracking and Quality Scoring

  1. New Tables
    - `difficulty_performance`
      - Tracks which difficulty levels perform best for different challenge types
      - Stores completion rates, solve times, and medal distribution
    - `challenge_quality_scores`
      - AI-generated quality scores for challenges
      - Tracks issues and strengths of generated hints
    - `ai_usage_log`
      - Tracks AI API usage for cost monitoring

  2. Functions
    - `update_difficulty_performance`: Updates performance metrics when challenges are completed

  3. Security
    - Enable RLS on all tables
    - Public can read performance data and quality scores
    - Only authenticated requests can write
*/

CREATE TABLE IF NOT EXISTS difficulty_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_type text NOT NULL CHECK (challenge_type IN ('person', 'place', 'thing')),
  fame_score integer NOT NULL CHECK (fame_score >= 0 AND fame_score <= 5),
  selected_phase1_index integer CHECK (selected_phase1_index IN (0, 1, 2)),
  selected_phase2_index integer CHECK (selected_phase2_index IN (0, 1, 2)),

  total_attempts integer DEFAULT 0,
  gold_completions integer DEFAULT 0,
  silver_completions integer DEFAULT 0,
  bronze_completions integer DEFAULT 0,
  failures integer DEFAULT 0,

  avg_solve_time_seconds numeric,
  min_solve_time_seconds integer,
  max_solve_time_seconds integer,

  completion_rate numeric,

  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),

  UNIQUE(challenge_type, fame_score, selected_phase1_index, selected_phase2_index)
);

CREATE INDEX idx_difficulty_perf_type_fame ON difficulty_performance(challenge_type, fame_score);
CREATE INDEX idx_difficulty_perf_completion_rate ON difficulty_performance(completion_rate DESC);

ALTER TABLE difficulty_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view difficulty performance"
  ON difficulty_performance FOR SELECT
  TO public
  USING (true);

CREATE TABLE IF NOT EXISTS challenge_quality_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id text REFERENCES challenges(id),
  quality_score integer CHECK (quality_score >= 0 AND quality_score <= 100),
  issues jsonb,
  strengths jsonb,
  regenerated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_quality_scores_challenge ON challenge_quality_scores(challenge_id);
CREATE INDEX idx_quality_scores_score ON challenge_quality_scores(quality_score DESC);

ALTER TABLE challenge_quality_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view quality scores"
  ON challenge_quality_scores FOR SELECT
  TO public
  USING (true);

CREATE TABLE IF NOT EXISTS ai_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  model text NOT NULL,
  input_tokens integer NOT NULL,
  output_tokens integer NOT NULL,
  estimated_cost numeric(10, 6),
  cached boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ai_usage_created ON ai_usage_log(created_at DESC);

ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view AI usage"
  ON ai_usage_log FOR SELECT
  TO public
  USING (true);

CREATE OR REPLACE FUNCTION update_difficulty_performance(
  p_challenge_type text,
  p_fame_score integer,
  p_phase1_index integer,
  p_phase2_index integer,
  p_completed_phase integer,
  p_solve_time_seconds integer,
  p_total_attempts integer
) RETURNS void AS $$
DECLARE
  v_is_gold boolean := (p_completed_phase = 1);
  v_is_silver boolean := (p_completed_phase = 2);
  v_is_bronze boolean := (p_completed_phase = 3);
  v_is_failure boolean := (p_completed_phase IS NULL);
BEGIN
  INSERT INTO difficulty_performance (
    challenge_type,
    fame_score,
    selected_phase1_index,
    selected_phase2_index,
    total_attempts,
    gold_completions,
    silver_completions,
    bronze_completions,
    failures,
    avg_solve_time_seconds,
    min_solve_time_seconds,
    max_solve_time_seconds,
    completion_rate,
    last_updated
  ) VALUES (
    p_challenge_type,
    p_fame_score,
    p_phase1_index,
    p_phase2_index,
    1,
    CASE WHEN v_is_gold THEN 1 ELSE 0 END,
    CASE WHEN v_is_silver THEN 1 ELSE 0 END,
    CASE WHEN v_is_bronze THEN 1 ELSE 0 END,
    CASE WHEN v_is_failure THEN 1 ELSE 0 END,
    COALESCE(p_solve_time_seconds, 0),
    COALESCE(p_solve_time_seconds, 0),
    COALESCE(p_solve_time_seconds, 0),
    CASE WHEN v_is_failure THEN 0.0 ELSE 1.0 END,
    now()
  )
  ON CONFLICT (challenge_type, fame_score, selected_phase1_index, selected_phase2_index)
  DO UPDATE SET
    total_attempts = difficulty_performance.total_attempts + 1,
    gold_completions = difficulty_performance.gold_completions + CASE WHEN v_is_gold THEN 1 ELSE 0 END,
    silver_completions = difficulty_performance.silver_completions + CASE WHEN v_is_silver THEN 1 ELSE 0 END,
    bronze_completions = difficulty_performance.bronze_completions + CASE WHEN v_is_bronze THEN 1 ELSE 0 END,
    failures = difficulty_performance.failures + CASE WHEN v_is_failure THEN 1 ELSE 0 END,
    avg_solve_time_seconds = (
      (difficulty_performance.avg_solve_time_seconds * difficulty_performance.total_attempts + COALESCE(p_solve_time_seconds, 0))
      / (difficulty_performance.total_attempts + 1)
    ),
    min_solve_time_seconds = LEAST(difficulty_performance.min_solve_time_seconds, COALESCE(p_solve_time_seconds, difficulty_performance.min_solve_time_seconds)),
    max_solve_time_seconds = GREATEST(difficulty_performance.max_solve_time_seconds, COALESCE(p_solve_time_seconds, difficulty_performance.max_solve_time_seconds)),
    completion_rate = (
      (difficulty_performance.gold_completions + difficulty_performance.silver_completions + difficulty_performance.bronze_completions + CASE WHEN NOT v_is_failure THEN 1 ELSE 0 END)::numeric
      / (difficulty_performance.total_attempts + 1)::numeric
    ),
    last_updated = now();
END;
$$ LANGUAGE plpgsql;
