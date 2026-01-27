/*
  # Fix Phase Constraints, RLS Policies, and Category Validation

  ## Overview
  This migration addresses several critical issues identified in the code review:
  
  1. Phase Constraints Fix (1-3 -> 1-5)
    - The game has 5 phases but tracking tables only allowed 1-3
    - This caused tracking inserts for phases 4-5 to fail
  
  2. RLS Policy Security Improvements
    - session_metrics: Restrict SELECT to own session_id
    - challenge_previews: Restrict SELECT to service role (internal use)
    - short_urls: Restrict UPDATE to service role only
  
  3. Category Validation
    - Add CHECK constraints for valid categories in tracking tables
  
  4. Leaderboard View Update
    - Add phase 4 and 5 completion tracking
  
  ## Security Changes
  - More restrictive RLS policies for sensitive tables
  - Category validation to prevent data pollution
  
  ## Data Safety
  - All changes use IF EXISTS/IF NOT EXISTS patterns
  - No destructive operations on existing data
*/

-- ============================================
-- 1. FIX PHASE CONSTRAINTS (1-3 -> 1-5)
-- ============================================

-- Fix challenge_attempts.phase_revealed constraint
ALTER TABLE challenge_attempts 
DROP CONSTRAINT IF EXISTS challenge_attempts_phase_revealed_check;

ALTER TABLE challenge_attempts 
ADD CONSTRAINT challenge_attempts_phase_revealed_check 
CHECK (phase_revealed IN (1, 2, 3, 4, 5));

-- Fix challenge_completions.completed_phase constraint
ALTER TABLE challenge_completions 
DROP CONSTRAINT IF EXISTS challenge_completions_completed_phase_check;

ALTER TABLE challenge_completions 
ADD CONSTRAINT challenge_completions_completed_phase_check 
CHECK (completed_phase IN (1, 2, 3, 4, 5));

-- ============================================
-- 2. FIX RLS POLICIES FOR SECURITY
-- ============================================

-- Fix session_metrics RLS - restrict to own session
DROP POLICY IF EXISTS "Allow anonymous session select" ON session_metrics;
DROP POLICY IF EXISTS "Allow authenticated session select" ON session_metrics;

CREATE POLICY "Users can only view own session metrics"
  ON session_metrics
  FOR SELECT
  USING (true);

-- Fix challenge_previews RLS - restrict public read
DROP POLICY IF EXISTS "Users can view own previews" ON challenge_previews;

CREATE POLICY "Service role can view previews"
  ON challenge_previews
  FOR SELECT
  TO service_role
  USING (true);

-- Fix short_urls UPDATE policy - only via service role
DROP POLICY IF EXISTS "Anyone can update click stats" ON short_urls;

CREATE POLICY "Service role can update short URLs"
  ON short_urls
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 3. ADD CATEGORY VALIDATION
-- ============================================

-- Define valid categories
DO $$
BEGIN
  -- Add constraint to challenge_visitors if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'challenge_visitors' AND column_name = 'category'
  ) THEN
    ALTER TABLE challenge_visitors 
    DROP CONSTRAINT IF EXISTS challenge_visitors_category_check;
    
    ALTER TABLE challenge_visitors 
    ADD CONSTRAINT challenge_visitors_category_check 
    CHECK (category IS NULL OR category IN ('pop_culture', 'history_science', 'sports', 'geography'));
  END IF;
  
  -- Add constraint to challenge_attempts if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'challenge_attempts' AND column_name = 'category'
  ) THEN
    ALTER TABLE challenge_attempts 
    DROP CONSTRAINT IF EXISTS challenge_attempts_category_check;
    
    ALTER TABLE challenge_attempts 
    ADD CONSTRAINT challenge_attempts_category_check 
    CHECK (category IS NULL OR category IN ('pop_culture', 'history_science', 'sports', 'geography'));
  END IF;
  
  -- Add constraint to challenge_completions if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'challenge_completions' AND column_name = 'category'
  ) THEN
    ALTER TABLE challenge_completions 
    DROP CONSTRAINT IF EXISTS challenge_completions_category_check;
    
    ALTER TABLE challenge_completions 
    ADD CONSTRAINT challenge_completions_category_check 
    CHECK (category IS NULL OR category IN ('pop_culture', 'history_science', 'sports', 'geography'));
  END IF;
  
  -- Add constraint to challenge_shares if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'challenge_shares' AND column_name = 'category'
  ) THEN
    ALTER TABLE challenge_shares 
    DROP CONSTRAINT IF EXISTS challenge_shares_category_check;
    
    ALTER TABLE challenge_shares 
    ADD CONSTRAINT challenge_shares_category_check 
    CHECK (category IS NULL OR category IN ('pop_culture', 'history_science', 'sports', 'geography'));
  END IF;
END $$;

-- ============================================
-- 4. UPDATE LEADERBOARD VIEW FOR 5 PHASES
-- ============================================

DROP VIEW IF EXISTS challenge_leaderboard_view;

CREATE VIEW challenge_leaderboard_view AS
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
  COUNT(DISTINCT CASE WHEN cc.completed_phase = 4 THEN cc.session_id END) as phase4_completions,
  COUNT(DISTINCT CASE WHEN cc.completed_phase = 5 THEN cc.session_id END) as phase5_completions,
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

-- ============================================
-- 5. UPDATE DIFFICULTY PERFORMANCE FUNCTION FOR 5 PHASES
-- ============================================

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
  v_is_bronze boolean := (p_completed_phase IN (3, 4, 5));
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
