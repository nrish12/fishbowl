/*
  # Add hints storage to challenges table

  1. Changes
    - Add `hints` column (jsonb) to store generated hints
    - Add `aliases` column (text array) for guess matching
    
  2. Notes
    - This allows us to cache generated hints and avoid regenerating them
    - Reduces OpenAI API calls and improves performance
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'challenges' AND column_name = 'hints'
  ) THEN
    ALTER TABLE challenges ADD COLUMN hints jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'challenges' AND column_name = 'aliases'
  ) THEN
    ALTER TABLE challenges ADD COLUMN aliases text[];
  END IF;
END $$;