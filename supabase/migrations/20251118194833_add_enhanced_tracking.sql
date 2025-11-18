/*
  # Enhanced Analytics Tracking

  1. New Tables
    - `page_views`
      - Tracks individual page views with session data
      - Includes referrer and landing page information
    - `user_interactions`
      - Tracks button clicks and other user interactions
      - Records element IDs and interaction types
    - `session_metrics`
      - Aggregates session-level metrics
      - Tracks time on site, pages viewed, and engagement

  2. Changes
    - Extends existing analytics system with more granular tracking
    - Adds indexes for performance on frequently queried columns

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated and anonymous users to insert tracking data
*/

-- Page Views Tracking
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  page_path text NOT NULL,
  page_title text,
  referrer text,
  landing_page boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous page view tracking"
  ON page_views
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated page view tracking"
  ON page_views
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);

-- User Interactions Tracking
CREATE TABLE IF NOT EXISTS user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  interaction_type text NOT NULL,
  element_id text,
  element_text text,
  page_path text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous interaction tracking"
  ON user_interactions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated interaction tracking"
  ON user_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);

-- Session Metrics
CREATE TABLE IF NOT EXISTS session_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  first_visit timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  total_page_views int DEFAULT 0,
  total_time_seconds int DEFAULT 0,
  referrer_source text,
  device_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE session_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous session metrics"
  ON session_metrics
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated session metrics"
  ON session_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous session updates"
  ON session_metrics
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated session updates"
  ON session_metrics
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_session_metrics_session_id ON session_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_session_metrics_created_at ON session_metrics(created_at);
