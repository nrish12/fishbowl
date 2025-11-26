/*
  # Keep Edge Functions Warm

  1. Purpose
    - Prevents cold starts on critical edge functions
    - Pings functions every 5 minutes to keep them active
    - Improves user experience by reducing latency

  2. Functions to Keep Warm
    - check-guess: Main guess validation endpoint
    - phase4-nudge: AI hint generation for Phase 4
    - phase5-visual: AI visual synthesis for Phase 5

  3. Implementation
    - Creates a pg_cron job that runs every 5 minutes
    - Makes lightweight HTTP requests to each function
    - Uses pg_net extension for async HTTP calls
*/

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to ping edge functions
CREATE OR REPLACE FUNCTION keep_functions_warm()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url text;
  anon_key text;
BEGIN
  -- Get environment variables
  supabase_url := current_setting('app.settings.supabase_url', true);
  anon_key := current_setting('app.settings.supabase_anon_key', true);

  -- If settings aren't available, use env vars
  IF supabase_url IS NULL THEN
    supabase_url := current_setting('env.SUPABASE_URL', true);
  END IF;

  IF anon_key IS NULL THEN
    anon_key := current_setting('env.SUPABASE_ANON_KEY', true);
  END IF;

  -- Only ping if we have the required config
  IF supabase_url IS NOT NULL AND anon_key IS NOT NULL THEN
    -- Ping check-guess (lightweight OPTIONS request)
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/check-guess',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || anon_key,
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('warmup', true)
    );

    -- Ping phase4-nudge
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/phase4-nudge',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || anon_key,
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('warmup', true)
    );

    -- Ping phase5-visual
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/phase5-visual',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || anon_key,
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('warmup', true)
    );
  END IF;
END;
$$;

-- Schedule the function to run every 5 minutes
-- Note: This uses pg_cron which may need to be enabled in Supabase dashboard
SELECT cron.schedule(
  'keep-functions-warm',
  '*/5 * * * *', -- Every 5 minutes
  $$SELECT keep_functions_warm();$$
);
