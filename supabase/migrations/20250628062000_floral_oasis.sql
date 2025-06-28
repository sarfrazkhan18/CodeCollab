/*
  # Real-time Features Setup

  1. Enable real-time on tables
  2. Set up publication for real-time subscriptions
  3. Add functions for real-time collaboration
*/

-- Enable real-time on collaboration tables
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE project_files;

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update collaboration session activity
CREATE OR REPLACE FUNCTION update_collaboration_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE collaboration_sessions
  SET last_activity = NOW()
  WHERE user_id = auth.uid()
    AND project_id = NEW.project_id
    AND is_active = TRUE;
  
  IF NOT FOUND THEN
    INSERT INTO collaboration_sessions (project_id, user_id, session_data, is_active)
    VALUES (NEW.project_id, auth.uid(), '{}', TRUE);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update collaboration activity when files are modified
CREATE TRIGGER update_collaboration_on_file_change
  AFTER INSERT OR UPDATE ON project_files
  FOR EACH ROW EXECUTE FUNCTION update_collaboration_activity();

-- Function to clean up inactive collaboration sessions
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS INTEGER AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE collaboration_sessions
  SET is_active = FALSE
  WHERE last_activity < NOW() - INTERVAL '1 hour'
    AND is_active = TRUE;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;