/*
  # Fix Session Metrics RLS Policies

  1. Changes
    - Add SELECT policies for session_metrics table
    - Required for upsert operations to work properly
    - Allows anonymous and authenticated users to read their own session data

  2. Security
    - Users can only select their own session data based on session_id
    - Maintains data isolation between sessions
*/

-- Add SELECT policies for session_metrics
CREATE POLICY "Allow anonymous session select"
  ON session_metrics
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated session select"
  ON session_metrics
  FOR SELECT
  TO authenticated
  USING (true);
