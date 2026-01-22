/*
  # Add Difficulty Level to Daily Challenges

  1. Changes
    - Add `difficulty` column to `daily_challenges` table
    - Values: 'easy', 'medium', 'hard'
    - Each category can have a different difficulty on the same day
    - This affects which hint variations (phase1/phase2) are selected

  2. Purpose
    - Adds variety to daily challenges by randomly assigning difficulty levels
    - Easy challenges use more obvious hints
    - Hard challenges use more cryptic/subtle hints
    - Geography might be hard while Sports is easy on the same day
*/

-- Add difficulty column with default of 'medium'
ALTER TABLE daily_challenges
ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'medium'
CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Add index for querying by difficulty
CREATE INDEX IF NOT EXISTS idx_daily_challenges_difficulty
ON daily_challenges(difficulty);

-- Add comment for documentation
COMMENT ON COLUMN daily_challenges.difficulty IS 'Difficulty level for this daily challenge: easy (obvious hints), medium (balanced), hard (cryptic hints)';