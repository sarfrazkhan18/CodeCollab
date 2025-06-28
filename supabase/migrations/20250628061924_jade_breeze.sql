/*
  # Initial Schema for CodeCollab AI

  1. New Tables
    - `profiles` - User profile information extending Supabase auth
    - `projects` - User projects and workspaces
    - `project_files` - File storage and versioning
    - `collaboration_sessions` - Real-time collaboration sessions
    - `comments` - Code comments and annotations
    - `ai_interactions` - AI agent interaction history

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure file access based on project ownership
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  framework TEXT DEFAULT 'react',
  template TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Files Table
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  content TEXT,
  file_type TEXT,
  size_bytes INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, file_path)
);

-- Collaboration Sessions Table
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_data JSONB DEFAULT '{}',
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  line_number INTEGER,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Interactions Table
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- File Versions Table (for version control)
CREATE TABLE IF NOT EXISTS file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_file_id UUID REFERENCES project_files(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  content TEXT,
  change_description TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Collaborators Table
CREATE TABLE IF NOT EXISTS project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'collaborator' CHECK (role IN ('owner', 'admin', 'collaborator', 'viewer')),
  invited_by UUID REFERENCES profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Projects Policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    is_public = TRUE OR
    id IN (
      SELECT project_id FROM project_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    id IN (
      SELECT project_id FROM project_collaborators 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    id IN (
      SELECT project_id FROM project_collaborators 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Project Files Policies
CREATE POLICY "Users can view project files they have access to"
  ON project_files FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid() OR is_public = TRUE
      UNION
      SELECT project_id FROM project_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify files in their projects"
  ON project_files FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM project_collaborators 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'collaborator')
    )
  );

-- Collaboration Sessions Policies
CREATE POLICY "Users can view collaboration sessions for accessible projects"
  ON collaboration_sessions FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid() OR is_public = TRUE
      UNION
      SELECT project_id FROM project_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own collaboration sessions"
  ON collaboration_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own collaboration sessions"
  ON collaboration_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Comments Policies
CREATE POLICY "Users can view comments on accessible projects"
  ON comments FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE user_id = auth.uid() OR is_public = TRUE
      UNION
      SELECT project_id FROM project_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments on accessible projects"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM project_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- AI Interactions Policies
CREATE POLICY "Users can view their own AI interactions"
  ON ai_interactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create AI interactions"
  ON ai_interactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- File Versions Policies
CREATE POLICY "Users can view file versions for accessible projects"
  ON file_versions FOR SELECT
  TO authenticated
  USING (
    project_file_id IN (
      SELECT id FROM project_files 
      WHERE project_id IN (
        SELECT id FROM projects 
        WHERE user_id = auth.uid() OR is_public = TRUE
        UNION
        SELECT project_id FROM project_collaborators 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Project Collaborators Policies
CREATE POLICY "Users can view collaborators of accessible projects"
  ON project_collaborators FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM project_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can manage collaborators"
  ON project_collaborators FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM project_collaborators 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_path ON project_files(project_id, file_path);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_project_user ON collaboration_sessions(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_comments_project_file ON comments(project_id, file_path);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_project ON ai_interactions(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_file_id ON file_versions(project_file_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_user ON project_collaborators(project_id, user_id);

-- Functions for automatic timestamping
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamping
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_files_updated_at
  BEFORE UPDATE ON project_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();