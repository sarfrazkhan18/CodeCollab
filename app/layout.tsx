import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@/components/analytics';
import { SupabaseProvider } from '@/components/supabase-provider';

export const metadata: Metadata = {
  title: 'CodeCollab AI',
  description: 'Collaborative coding platform powered by AI agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SupabaseProvider>
            {children}
            <Toaster />
            <Analytics />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}