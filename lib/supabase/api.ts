import { supabase } from './client';
import { Database } from './types';

type Tables = Database['public']['Tables'];
type Project = Tables['projects']['Row'];
type ProjectFile = Tables['project_files']['Row'];
type Profile = Tables['profiles']['Row'];
type Comment = Tables['comments']['Row'];

// Projects API
export const projectsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        ),
        project_collaborators (
          user_id,
          role,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        ),
        project_collaborators (
          user_id,
          role,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(project: Tables['projects']['Insert']) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Tables['projects']['Update']) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Project Files API
export const filesApi = {
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('file_path');

    if (error) throw error;
    return data;
  },

  async getByPath(projectId: string, filePath: string) {
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .eq('file_path', filePath)
      .single();

    if (error) throw error;
    return data;
  },

  async upsert(file: Tables['project_files']['Insert']) {
    const { data, error } = await supabase
      .from('project_files')
      .upsert(file, {
        onConflict: 'project_id,file_path'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(projectId: string, filePath: string) {
    const { error } = await supabase
      .from('project_files')
      .delete()
      .eq('project_id', projectId)
      .eq('file_path', filePath);

    if (error) throw error;
  },
};

// Comments API
export const commentsApi = {
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getByFile(projectId: string, filePath: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .eq('file_path', filePath)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(comment: Tables['comments']['Insert']) {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select(`
        *,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Tables['comments']['Update']) {
    const { data, error } = await supabase
      .from('comments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Collaboration API
export const collaborationApi = {
  async getActiveSessions(projectId: string) {
    const { data, error } = await supabase
      .from('collaboration_sessions')
      .select(`
        *,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .gte('last_activity', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

    if (error) throw error;
    return data;
  },

  async updateSession(projectId: string, sessionData: any = {}) {
    const { data, error } = await supabase
      .from('collaboration_sessions')
      .upsert({
        project_id: projectId,
        user_id: (await supabase.auth.getUser()).data.user?.id!,
        session_data: sessionData,
        last_activity: new Date().toISOString(),
        is_active: true,
      }, {
        onConflict: 'project_id,user_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async endSession(projectId: string) {
    const { error } = await supabase
      .from('collaboration_sessions')
      .update({ is_active: false })
      .eq('project_id', projectId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id!);

    if (error) throw error;
  },

  // Real-time subscriptions
  subscribeToProject(projectId: string, callbacks: {
    onFileChange?: (payload: any) => void;
    onCommentChange?: (payload: any) => void;
    onPresenceChange?: (payload: any) => void;
  }) {
    const subscriptions = [];

    if (callbacks.onFileChange) {
      const fileSubscription = supabase
        .channel(`project-files-${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'project_files',
            filter: `project_id=eq.${projectId}`,
          },
          callbacks.onFileChange
        )
        .subscribe();
      subscriptions.push(fileSubscription);
    }

    if (callbacks.onCommentChange) {
      const commentSubscription = supabase
        .channel(`comments-${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments',
            filter: `project_id=eq.${projectId}`,
          },
          callbacks.onCommentChange
        )
        .subscribe();
      subscriptions.push(commentSubscription);
    }

    if (callbacks.onPresenceChange) {
      const presenceSubscription = supabase
        .channel(`presence-${projectId}`)
        .on('presence', { event: 'sync' }, callbacks.onPresenceChange)
        .on('presence', { event: 'join' }, callbacks.onPresenceChange)
        .on('presence', { event: 'leave' }, callbacks.onPresenceChange)
        .subscribe();
      subscriptions.push(presenceSubscription);
    }

    return {
      unsubscribe: () => {
        subscriptions.forEach(sub => sub.unsubscribe());
      }
    };
  },
};

// Profiles API
export const profilesApi = {
  async getCurrent() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async update(updates: Tables['profiles']['Update']) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};