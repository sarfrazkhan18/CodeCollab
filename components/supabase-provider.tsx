'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

// Create Supabase client with error handling
const createSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Don't create client on server side
    return null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if environment variables are set to placeholder values or missing
  if (!url || url === 'https://your-project-url.supabase.co' || !url.startsWith('https://')) {
    console.warn('Supabase URL not configured. Running in demo mode without authentication.');
    return null;
  }

  if (!key || key === 'your-anon-key') {
    console.warn('Supabase anon key not configured. Running in demo mode without authentication.');
    return null;
  }

  try {
    return createClient(url, key);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
};

export const supabase = createSupabaseClient();

type SupabaseContextType = {
  user: any | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
  loading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signInWithGoogle: async () => ({}),
  signOut: async () => ({}),
  loading: true,
});

export const useSupabase = () => useContext(SupabaseContext);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!supabase) {
      // Running in demo mode without Supabase
      setLoading(false);
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [isMounted, toast]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      toast({
        title: 'Demo Mode',
        description: 'Authentication is not available in demo mode. Configure Supabase to enable authentication.',
        variant: 'destructive',
      });
      throw new Error('Supabase not configured');
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        title: 'Error signing in',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      toast({
        title: 'Demo Mode',
        description: 'Authentication is not available in demo mode. Configure Supabase to enable authentication.',
        variant: 'destructive',
      });
      throw new Error('Supabase not configured');
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        title: 'Error signing up',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      toast({
        title: 'Demo Mode',
        description: 'Authentication is not available in demo mode. Configure Supabase to enable authentication.',
        variant: 'destructive',
      });
      throw new Error('Supabase not configured');
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        title: 'Error signing in with Google',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    if (!supabase) {
      toast({
        title: 'Demo Mode',
        description: 'Authentication is not available in demo mode.',
        variant: 'destructive',
      });
      throw new Error('Supabase not configured');
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error: any) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Don't render children until mounted on client
  if (!isMounted) {
    return null;
  }

  return (
    <SupabaseContext.Provider value={{ user, signIn, signUp, signInWithGoogle, signOut, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
}