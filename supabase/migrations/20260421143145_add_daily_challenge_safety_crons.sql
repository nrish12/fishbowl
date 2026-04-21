/*
  # Add Safety Net Crons for Daily Challenge Generation

  1. Problem
    - Single cron job at 23:50 UTC was the only chance to generate tomorrow's challenges
    - If that run failed (OpenAI outage, timeout, rate limits), the first player to visit
      would trigger on-demand generation and hit a 30+ second timeout
  
  2. Solution
    - Add two safety-net cron jobs that run shortly after midnight UTC
    - Each job calls generate-daily-challenge with ?today=true
    - The edge function is idempotent: it skips categories that already exist
    - Result: up to 3 independent attempts per day to ensure all 4 categories are ready
  
  3. Schedule Summary
    - 23:50 UTC: primary generation (for tomorrow)
    - 00:05 UTC: safety net #1 (for today, backfills anything missing)
    - 01:00 UTC: safety net #2 (for today, final catch-up)
  
  4. Notes
    - Uses pg_net.http_post (already available)
    - Safe to re-run: generate-daily-challenge checks existing rows before calling OpenAI
*/

SELECT cron.unschedule('daily-challenge-safety-1') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-challenge-safety-1'
);

SELECT cron.unschedule('daily-challenge-safety-2') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-challenge-safety-2'
);

SELECT cron.schedule(
  'daily-challenge-safety-1',
  '5 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://gopbvdtgionfrlquvaqq.supabase.co/functions/v1/generate-daily-challenge?today=true',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvcGJ2ZHRnaW9uZnJscXV2YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjI0NTgsImV4cCI6MjA3NzgzODQ1OH0.K2fFbKKZHWtbHIJgQySa700506nZL2P5obzhE00VZI8"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'daily-challenge-safety-2',
  '0 1 * * *',
  $$
  SELECT net.http_post(
    url := 'https://gopbvdtgionfrlquvaqq.supabase.co/functions/v1/generate-daily-challenge?today=true',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvcGJ2ZHRnaW9uZnJscXV2YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjI0NTgsImV4cCI6MjA3NzgzODQ1OH0.K2fFbKKZHWtbHIJgQySa700506nZL2P5obzhE00VZI8"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
