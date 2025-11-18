/*
  # Setup Daily Challenge Pre-generation (v2 - Simplified)

  1. Configuration
    - Creates a cron job that runs at 11:50 PM UTC daily
    - Uses pg_net to call the generate-daily-challenge edge function
    - Pre-generates tomorrow's challenge before midnight
  
  2. Benefits
    - Users get instant challenge loading (no 30-second wait)
    - Challenge is generated before anyone visits the site
    - Runs automatically every day
  
  3. Notes
    - The cron job runs at 23:50 UTC (11:50 PM) to ensure the challenge is ready by midnight
    - Uses pg_net.http_post which is already available in Supabase
*/

-- First, remove the old cron job if it exists
SELECT cron.unschedule('generate-daily-challenge') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'generate-daily-challenge'
);

-- Schedule daily challenge generation at 11:50 PM UTC every day
SELECT cron.schedule(
  'generate-daily-challenge',
  '50 23 * * *',
  $$
  SELECT net.http_post(
    url := 'https://gopbvdtgionfrlquvaqq.supabase.co/functions/v1/generate-daily-challenge',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvcGJ2ZHRnaW9uZnJscXV2YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjI0NTgsImV4cCI6MjA3NzgzODQ1OH0.K2fFbKKZHWtbHIJgQySa700506nZL2P5obzhE00VZI8"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);