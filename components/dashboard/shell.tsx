'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CodeIcon, 
  PlusIcon, 
  FolderIcon, 
  SettingsIcon, 
  LogOutIcon,
  LayoutDashboardIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectsList } from '@/components/dashboard/projects-list';
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog';
import { useSupabase } from '@/components/supabase-provider';
import { ThemeToggle } from '@/components/theme-toggle';

export function DashboardShell() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { signOut, user } = useSupabase();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-card border-r">
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <CodeIcon className="h-5 w-5 text-primary" />
            <span className="font-semibold">CodeCollab AI</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <div className="px-3 py-2">
            <h2 className="px-4 text-lg font-semibold tracking-tight">Dashboard</h2>
            <div className="space-y-1 py-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <div className="flex items-center">
                  <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                  Projects
                </div>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <div className="flex items-center">
                  <FolderIcon className="mr-2 h-4 w-4" />
                  Templates
                </div>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <div className="flex items-center">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </div>
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t p-4">
          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOutIcon className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div className="flex items-center md:hidden">
            <CodeIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Your Projects</h2>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
            <ProjectsList />
          </div>
        </main>
      </div>

      <CreateProjectDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
}