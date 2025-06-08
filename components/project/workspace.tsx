'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CodeIcon, 
  PanelLeftIcon, 
  PanelRightIcon, 
  PlayIcon,
  SaveIcon,
  FileIcon,
  FolderIcon,
  UsersIcon,
  BrainCircuitIcon,
  RocketIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/components/supabase-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { CodeEditor } from '@/components/project/code-editor';
import { FileExplorer } from '@/components/project/file-explorer';
import { AgentPanel } from '@/components/project/agent-panel';

interface ProjectWorkspaceProps {
  projectId: string;
}

export function ProjectWorkspace({ projectId }: ProjectWorkspaceProps) {
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [projectName, setProjectName] = useState('Loading...');
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setIsLoadingProject(true);
        
        // This would be a real Supabase query in production
        // For demo purposes, we're using mock data
        setTimeout(() => {
          if (projectId === 'new-project-id') {
            setProjectName('My Awesome Project');
          } else if (projectId === '1') {
            setProjectName('Instagram Clone');
          } else if (projectId === '2') {
            setProjectName('E-Commerce Dashboard');
          } else if (projectId === '3') {
            setProjectName('Task Management App');
          } else {
            setProjectName(`Project ${projectId}`);
          }
          setIsLoadingProject(false);
        }, 800);
        
        // In production, you would use:
        // const { data, error } = await supabase
        //   .from('projects')
        //   .select('*')
        //   .eq('id', projectId)
        //   .single();
        
      } catch (error) {
        console.error('Error fetching project details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project details',
          variant: 'destructive',
        });
        setIsLoadingProject(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, toast]);

  const toggleLeftPanel = () => {
    setShowLeftPanel(!showLeftPanel);
  };

  const toggleRightPanel = () => {
    setShowRightPanel(!showRightPanel);
  };

  const handleFileSelect = (filePath: string) => {
    setCurrentFile(filePath);
  };

  const handleSaveFile = () => {
    toast({
      title: 'File saved',
      description: currentFile ? `Saved ${currentFile}` : 'All changes saved',
    });
  };

  const handleRunProject = () => {
    toast({
      title: 'Project running',
      description: 'Starting development server...',
    });
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
            className="mr-2"
          >
            <CodeIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{projectName}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveFile}>
            <SaveIcon className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="default" size="sm" onClick={handleRunProject}>
            <PlayIcon className="mr-2 h-4 w-4" />
            Run
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main workspace */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left panel (File explorer) */}
          {showLeftPanel && (
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <Tabs defaultValue="files">
                <div className="flex items-center justify-between border-b p-2">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="agents">Agents</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="files" className="p-0 h-[calc(100vh-7.5rem)]">
                  <div className="h-full">
                    <FileExplorer onSelectFile={handleFileSelect} />
                  </div>
                </TabsContent>
                <TabsContent value="agents" className="p-0 h-[calc(100vh-7.5rem)]">
                  <div className="p-4">
                    <h3 className="font-medium mb-2">Active AI Agents</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-chart-1 flex items-center justify-center text-white font-bold text-xs">F</div>
                          <span className="ml-2 text-sm">Frontend Specialist</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-chart-2 flex items-center justify-center text-white font-bold text-xs">B</div>
                          <span className="ml-2 text-sm">Backend Specialist</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-chart-3 flex items-center justify-center text-white font-bold text-xs">D</div>
                          <span className="ml-2 text-sm">Database Specialist</span>
                        </div>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          Idle
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          )}

          <ResizableHandle withHandle />

          {/* Center panel (Code editor) */}
          <ResizablePanel defaultSize={showRightPanel ? 50 : 80}>
            <div className="h-full relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLeftPanel}
                  className="h-8 w-8 rounded-full bg-background shadow-sm"
                >
                  <PanelLeftIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleRightPanel}
                  className="h-8 w-8 rounded-full bg-background shadow-sm"
                >
                  <PanelRightIcon className="h-4 w-4" />
                </Button>
              </div>
              {currentFile ? (
                <CodeEditor filePath={currentFile} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 rounded-full bg-muted p-3">
                    <FileIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">No file selected</h3>
                  <p className="mb-6 text-muted-foreground max-w-md">
                    Select a file from the file explorer or create a new file to start coding
                  </p>
                  <Button>Create New File</Button>
                </div>
              )}
            </div>
          </ResizablePanel>

          {showRightPanel && (
            <>
              <ResizableHandle withHandle />
              
              {/* Right panel (Agent panel) */}
              <ResizablePanel defaultSize={30}>
                <AgentPanel projectId={projectId} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}