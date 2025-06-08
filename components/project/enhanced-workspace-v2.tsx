'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CodeIcon, PanelLeftIcon, PanelRightIcon, PlayIcon, SaveIcon, GitBranchIcon, TerminalIcon, SparklesIcon, MonitorIcon, SettingsIcon, BrainCircuitIcon, UsersIcon, RocketIcon, BookTemplateIcon as TemplateIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/hooks/use-toast';

// Import enhanced components
import { CodeEditor } from '@/components/project/code-editor';
import { FileExplorer } from '@/components/project/file-explorer';
import { AgentPanel } from '@/components/project/agent-panel';
import { LivePreview } from '@/components/project/live-preview';
import { GitPanel } from '@/components/project/git-panel';
import { TerminalPanel } from '@/components/project/terminal-panel';
import { EnhancedCodeGeneration } from '@/components/project/enhanced-code-generation';
import { CodeIntelligencePanel } from '@/components/intelligence/code-intelligence-panel';
import { DeploymentDashboard } from '@/components/deployment/deployment-dashboard';
import { CollaborationPanel } from '@/components/collaboration/collaboration-panel';
import { TemplateGallery } from '@/components/templates/template-gallery';
import { templateService, ProjectTemplate } from '@/lib/templates/project-templates';

interface EnhancedWorkspaceV2Props {
  projectId: string;
}

export function EnhancedWorkspaceV2({ projectId }: EnhancedWorkspaceV2Props) {
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [projectName, setProjectName] = useState('Loading...');
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [leftPanelTab, setLeftPanelTab] = useState('files');
  const [rightPanelTab, setRightPanelTab] = useState('intelligence');
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>({});
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Mock user data - in production this would come from auth
  const userId = 'user-123';
  const userName = 'John Doe';

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setIsLoadingProject(true);
        
        // Mock project loading - in production this would fetch from Supabase
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

          // Initialize with basic React project structure
          setProjectFiles({
            'package.json': JSON.stringify({
              name: 'my-project',
              version: '1.0.0',
              scripts: {
                dev: 'next dev',
                build: 'next build',
                start: 'next start'
              },
              dependencies: {
                'react': '^18.2.0',
                'react-dom': '^18.2.0',
                'next': '^14.0.0',
                'typescript': '^5.0.0'
              }
            }, null, 2),
            'src/App.tsx': `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Welcome to Your Project</h1>
        <p className="text-gray-600">Start building something amazing!</p>
      </div>
    </div>
  );
}

export default App;`,
            'src/index.tsx': `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
            'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
          });

          setIsLoadingProject(false);
        }, 800);
        
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

  const handleFileSelect = (filePath: string) => {
    setCurrentFile(filePath);
    setCurrentCode(projectFiles[filePath] || '');
  };

  const handleCodeGenerated = (code: string, filePath: string) => {
    setProjectFiles(prev => ({
      ...prev,
      [filePath]: code
    }));
    setCurrentFile(filePath);
    setCurrentCode(code);
  };

  const handleTemplateSelect = async (template: ProjectTemplate) => {
    try {
      const projectData = await templateService.createProjectFromTemplate(template.id, projectName);
      setProjectFiles(projectData.files);
      setShowTemplateGallery(false);
      
      // Select the main file
      const mainFile = Object.keys(projectData.files).find(file => 
        file.includes('App.tsx') || file.includes('index.tsx') || file.includes('main.tsx')
      );
      if (mainFile) {
        handleFileSelect(mainFile);
      }
      
      toast({
        title: 'Template applied',
        description: `${template.name} template has been applied to your project`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply template',
        variant: 'destructive',
      });
    }
  };

  const handleSaveFile = () => {
    if (currentFile) {
      setProjectFiles(prev => ({
        ...prev,
        [currentFile]: currentCode
      }));
    }
    toast({
      title: 'File saved',
      description: currentFile ? `Saved ${currentFile}` : 'All changes saved',
    });
  };

  const handleRunProject = () => {
    setRightPanelTab('preview');
    toast({
      title: 'Starting preview',
      description: 'Launching development server...',
    });
  };

  if (isLoadingProject) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (showTemplateGallery) {
    return (
      <div className="h-screen">
        <TemplateGallery onSelectTemplate={handleTemplateSelect} />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Enhanced Header */}
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
          <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-500 border-green-500/20">
            Live
          </Badge>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplateGallery(true)}
          >
            <TemplateIcon className="mr-2 h-4 w-4" />
            Templates
          </Button>
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

      {/* Enhanced Workspace */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Enhanced Left Panel */}
          {showLeftPanel && (
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <Tabs value={leftPanelTab} onValueChange={setLeftPanelTab} className="h-full flex flex-col">
                <div className="border-b p-2">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="files" className="text-xs">
                      <CodeIcon className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="git" className="text-xs">
                      <GitBranchIcon className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="text-xs">
                      <SparklesIcon className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="terminal" className="text-xs">
                      <TerminalIcon className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="deploy" className="text-xs">
                      <RocketIcon className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="files" className="flex-1 p-0">
                  <FileExplorer onSelectFile={handleFileSelect} />
                </TabsContent>
                
                <TabsContent value="git" className="flex-1 p-0">
                  <GitPanel projectId={projectId} />
                </TabsContent>
                
                <TabsContent value="ai" className="flex-1 p-0">
                  <EnhancedCodeGeneration 
                    projectId={projectId} 
                    onCodeGenerated={handleCodeGenerated}
                  />
                </TabsContent>
                
                <TabsContent value="terminal" className="flex-1 p-0">
                  <TerminalPanel projectId={projectId} />
                </TabsContent>
                
                <TabsContent value="deploy" className="flex-1 p-0">
                  <DeploymentDashboard projectId={projectId} projectName={projectName} />
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          )}

          <ResizableHandle withHandle />

          {/* Enhanced Center Panel (Code Editor) */}
          <ResizablePanel defaultSize={showRightPanel ? 45 : 75}>
            <div className="h-full relative">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLeftPanel(!showLeftPanel)}
                  className="h-8 w-8 rounded-full bg-background shadow-sm border"
                >
                  <PanelLeftIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className="h-8 w-8 rounded-full bg-background shadow-sm border"
                >
                  <PanelRightIcon className="h-4 w-4" />
                </Button>
              </div>
              
              {currentFile ? (
                <CodeEditor filePath={currentFile} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 rounded-full bg-muted p-3">
                    <CodeIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Welcome to Enhanced Workspace</h3>
                  <p className="mb-6 text-muted-foreground max-w-md">
                    Select a file from the explorer, generate code with AI, or create a new file to start coding
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setLeftPanelTab('files')}>
                      Browse Files
                    </Button>
                    <Button variant="outline" onClick={() => setLeftPanelTab('ai')}>
                      Generate Code
                    </Button>
                    <Button variant="outline" onClick={() => setShowTemplateGallery(true)}>
                      Use Template
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>

          {showRightPanel && (
            <>
              <ResizableHandle withHandle />
              
              {/* Enhanced Right Panel */}
              <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
                <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="h-full flex flex-col">
                  <div className="border-b p-2">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="intelligence">
                        <BrainCircuitIcon className="h-4 w-4 mr-2" />
                        Intelligence
                      </TabsTrigger>
                      <TabsTrigger value="preview">
                        <MonitorIcon className="h-4 w-4 mr-2" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="agents">
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        Agents
                      </TabsTrigger>
                      <TabsTrigger value="collab">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        Collab
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="intelligence" className="flex-1 p-0">
                    <CodeIntelligencePanel 
                      currentFile={currentFile}
                      code={currentCode}
                      language="typescript"
                    />
                  </TabsContent>
                  
                  <TabsContent value="preview" className="flex-1 p-0">
                    <LivePreview projectId={projectId} files={projectFiles} />
                  </TabsContent>
                  
                  <TabsContent value="agents" className="flex-1 p-0">
                    <AgentPanel projectId={projectId} />
                  </TabsContent>
                  
                  <TabsContent value="collab" className="flex-1 p-0">
                    <CollaborationPanel 
                      projectId={projectId}
                      currentFile={currentFile}
                      userId={userId}
                      userName={userName}
                    />
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}