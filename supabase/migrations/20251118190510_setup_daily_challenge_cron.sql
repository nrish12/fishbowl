/*
  # Setup Daily Challenge Pre-generation

  1. Configuration
    - Enables pg_cron extension for scheduled tasks
    - Creates a cron job that runs at 11:50 PM UTC daily
    - Calls the generate-daily-challenge edge function to pre-generate tomorrow's challenge
  
  2. Benefits
    - Users get instant challenge loading (no 30-second wait)
    - Challenge is generated before anyone visits the site
    - Runs automatically every day
  
  3. Notes
    - The cron job runs at 23:50 UTC (11:50 PM) to ensure the challenge is ready by midnight
    - If the challenge already exists, the function returns early (idempotent)
    - The function generates tomorrow's challenge, not today's
*/

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily challenge generation at 11:50 PM UTC every day
-- This ensures the challenge is ready before midnight when the date rolls over
SELECT cron.schedule(
  'generate-daily-challenge',
  '50 23 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/generate-daily-challenge',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Store Supabase URL and anon key in database settings for the cron job
-- These need to be set up once
DO $$
BEGIN
  -- Check if settings already exist, if not create them
  EXECUTE format('ALTER DATABASE %I SET app.settings.supabase_url = %L',
    current_database(),
    current_setting('env.SUPABASE_URL', true)
  );
  
  EXECUTE format('ALTER DATABASE %I SET app.settings.supabase_anon_key = %L',
    current_database(),
    current_setting('env.SUPABASE_ANON_KEY', true)
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not set database settings. Please set manually: ALTER DATABASE your_db SET app.settings.supabase_url = ''your_url'';';
END $$;