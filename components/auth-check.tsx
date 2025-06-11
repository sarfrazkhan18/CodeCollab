'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSupabase } from '@/components/supabase-provider';

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check if Supabase is not configured (demo mode)
    if (!loading && !user && !pathname.startsWith('/auth')) {
      // In demo mode, allow access to all pages
      const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-url.supabase.co';
      
      if (isSupabaseConfigured) {
        router.push('/auth/login');
      }
      // If Supabase is not configured, allow access (demo mode)
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // In demo mode (no Supabase), allow access to all pages
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-url.supabase.co';

  if (!isSupabaseConfigured || user || pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  return null;
}