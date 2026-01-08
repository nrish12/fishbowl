/*
  # Add Category Tracking to Analytics Tables

  This migration adds a `category` column to challenge tracking tables to enable
  analytics on which categories are most popular and how players perform by category.

  ## Changes

  1. Adds `category` column to `challenge_visitors` table
  2. Adds `category` column to `challenge_attempts` table  
  3. Adds `category` column to `challenge_completions` table
  4. Adds `category` column to `challenge_shares` table
  5. Creates indexes for category-based queries

  ## Notes
  - Column is nullable to support existing data and non-categorized challenges
  - Valid categories: pop_culture, history_science, sports, geography
*/

-- Add category to challenge_visitors
ALTER TABLE challenge_visitors
ADD COLUMN IF NOT EXISTS category text;

-- Add category to challenge_attempts
ALTER TABLE challenge_attempts
ADD COLUMN IF NOT EXISTS category text;

-- Add category to challenge_completions
ALTER TABLE challenge_completions
ADD COLUMN IF NOT EXISTS category text;

-- Add category to challenge_shares
ALTER TABLE challenge_shares
ADD COLUMN IF NOT EXISTS category text;

-- Create indexes for category analytics
CREATE INDEX IF NOT EXISTS idx_challenge_visitors_category ON challenge_visitors(category);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_category ON challenge_attempts(category);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_category ON challenge_completions(category);
CREATE INDEX IF NOT EXISTS idx_challenge_shares_category ON challenge_shares(category);

-- Create composite indexes for date + category analytics
CREATE INDEX IF NOT EXISTS idx_challenge_visitors_category_time 
ON challenge_visitors(category, first_visit_at);

CREATE INDEX IF NOT EXISTS idx_challenge_attempts_category_time 
ON challenge_attempts(category, attempted_at);

CREATE INDEX IF NOT EXISTS idx_challenge_completions_category_time 
ON challenge_completions(category, completed_at);
