/*
  # Seed Data for Development

  This file contains sample data for development and testing.
*/

-- Insert sample user profiles (these will be created automatically when users sign up)
-- But we can add some sample data for testing

-- Sample projects for development
DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  -- This is just sample data for development
  -- In real usage, user IDs will come from auth.users table
  
  -- Create a sample project
  INSERT INTO projects (id, user_id, name, description, framework, is_public)
  VALUES (
    gen_random_uuid(),
    gen_random_uuid(), -- This would be a real user ID in production
    'Sample React Dashboard',
    'A demo project showing a modern React dashboard with real-time features',
    'react',
    TRUE
  );
END $$;