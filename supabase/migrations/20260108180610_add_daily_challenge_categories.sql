/*
  # Add Category Support to Daily Challenges

  This migration adds support for multiple daily challenges per day, organized by category.
  Players can now choose from 4 different themed challenges each day:
  - pop_culture: Celebrities, movies, TV shows, viral moments
  - history_science: Historical figures, scientists, inventions, discoveries
  - sports: Athletes, teams, sporting events and moments
  - geography: Places, landmarks, countries, natural wonders

  ## Changes

  1. Adds `category` column to `daily_challenges` table
     - Type: text with CHECK constraint for valid categories
     - Default: 'general' for backwards compatibility with existing data

  2. Updates unique constraint
     - Old: unique on challenge_date only (one challenge per day)
     - New: unique on (challenge_date, category) pair (one challenge per category per day)

  3. Creates index for efficient category queries

  ## Backwards Compatibility
  - Existing daily challenges are assigned 'general' category
  - The 'general' category is reserved for legacy data and won't appear in new UI
*/

-- Step 1: Add category column with default for existing rows
ALTER TABLE daily_challenges
ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';

-- Step 2: Add CHECK constraint for valid categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'daily_challenges_category_check'
  ) THEN
    ALTER TABLE daily_challenges
    ADD CONSTRAINT daily_challenges_category_check
    CHECK (category IN ('general', 'pop_culture', 'history_science', 'sports', 'geography'));
  END IF;
END $$;

-- Step 3: Drop the old unique constraint on challenge_date only
-- First find and drop it (it might have different names)
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  WHERE t.relname = 'daily_challenges'
    AND c.contype = 'u'
    AND array_length(c.conkey, 1) = 1;
  
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE daily_challenges DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END IF;
END $$;

-- Step 4: Add composite unique constraint on (challenge_date, category)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'daily_challenges_date_category_unique'
  ) THEN
    ALTER TABLE daily_challenges
    ADD CONSTRAINT daily_challenges_date_category_unique
    UNIQUE (challenge_date, category);
  END IF;
END $$;

-- Step 5: Create index for efficient category lookups
CREATE INDEX IF NOT EXISTS idx_daily_challenges_category 
ON daily_challenges(category);

-- Step 6: Create index for date + category lookups
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date_category 
ON daily_challenges(challenge_date, category);
