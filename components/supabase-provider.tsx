'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

// Create Supabase client with error handling
const createSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate URL and key
  if (!url || url === 'your-project-url' || !url.startsWith('https://')) {
    console.error('Invalid or missing Supabase URL. Please set NEXT_PUBLIC_SUPABASE_URL in your .env file.');
    return null;
  }

  if (!key || key === 'your-anon-key') {
    console.error('Invalid or missing Supabase anon key. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
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
  const { toast } = useToast();

  useEffect(() => {
    if (!supabase) {
      toast({
        title: 'Configuration Error',
        description: 'Please check your Supabase configuration in the .env file.',
        variant: 'destructive',
      });
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
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Please configure your Supabase credentials in the .env file');
    
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
    if (!supabase) throw new Error('Please configure your Supabase credentials in the .env file');
    
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
    if (!supabase) throw new Error('Please configure your Supabase credentials in the .env file');
    
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
    if (!supabase) throw new Error('Please configure your Supabase credentials in the .env file');
    
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

  return (
    <SupabaseContext.Provider value={{ user, signIn, signUp, signInWithGoogle, signOut, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
}