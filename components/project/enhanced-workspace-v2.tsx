'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CodeIcon, 
  PanelLeftIcon, 
  PanelRightIcon, 
  PlayIcon, 
  SaveIcon, 
  GitBranchIcon, 
  TerminalIcon, 
  SparklesIcon, 
  MonitorIcon, 
  SettingsIcon, 
  BrainCircuitIcon, 
  UsersIcon, 
  RocketIcon, 
  BookTemplateIcon as TemplateIcon,
  FolderIcon,
  SearchIcon,
  MoreHorizontalIcon,
  ChevronDownIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { Input } from '@/components/ui/input';
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

interface Project {
  id: string;
  name: string;
  description: string;
  framework: string;
  template?: string;
  files: Record<string, string>;
  created_at: string;
  updated_at: string;
}

interface EnhancedWorkspaceV2Props {
  projectId: string;
}

export function EnhancedWorkspaceV2({ projectId }: EnhancedWorkspaceV2Props) {
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [leftPanelTab, setLeftPanelTab] = useState('files');
  const [rightPanelTab, setRightPanelTab] = useState('preview');
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>({});
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Mock user data
  const userId = 'user-123';
  const userName = 'John Doe';

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setIsLoadingProject(true);
      
      // Load project from localStorage
      const storedProjects = JSON.parse(localStorage.getItem('codecollab_projects') || '[]');
      let foundProject = storedProjects.find((p: Project) => p.id === projectId);
      
      // Demo projects
      if (!foundProject) {
        const demoProjects = {
          'demo-instagram': {
            id: 'demo-instagram',
            name: 'Instagram Clone',
            description: 'A social media app with photo sharing capabilities',
            framework: 'react',
            template: 'social-media',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            files: {}
          },
          'demo-ecommerce': {
            id: 'demo-ecommerce',
            name: 'E-Commerce Dashboard',
            description: 'Admin panel for managing products and orders',
            framework: 'react',
            template: 'ecommerce-store',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            files: {}
          },
          'demo-tasks': {
            id: 'demo-tasks',
            name: 'Task Management App',
            description: 'Collaborative task management with real-time updates',
            framework: 'react',
            template: 'task-manager',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            files: {}
          }
        };
        
        foundProject = demoProjects[projectId as keyof typeof demoProjects];
      }
      
      if (!foundProject) {
        toast({
          title: 'Project not found',
          description: 'The requested project could not be found',
          variant: 'destructive',
        });
        router.push('/dashboard');
        return;
      }
      
      setProject(foundProject);
      
      // Initialize project files if empty
      if (!foundProject.files || Object.keys(foundProject.files).length === 0) {
        const initialFiles = createInitialProjectFiles(foundProject);
        foundProject.files = initialFiles;
        
        // Update localStorage if it's a stored project
        if (storedProjects.some((p: Project) => p.id === projectId)) {
          const updatedProjects = storedProjects.map((p: Project) => 
            p.id === projectId ? foundProject : p
          );
          localStorage.setItem('codecollab_projects', JSON.stringify(updatedProjects));
        }
      }
      
      setProjectFiles(foundProject.files);
      
      // Select the main file
      const mainFile = Object.keys(foundProject.files).find(file => 
        file.includes('page.tsx') || file.includes('App.tsx') || file.includes('index.tsx')
      ) || Object.keys(foundProject.files)[0];
      
      if (mainFile) {
        setCurrentFile(mainFile);
        setCurrentCode(foundProject.files[mainFile] || '');
      }
      
      setIsLoadingProject(false);
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project',
        variant: 'destructive',
      });
      setIsLoadingProject(false);
    }
  };

  const createInitialProjectFiles = (project: Project): Record<string, string> => {
    const projectName = project.name.toLowerCase().replace(/\s+/g, '-');
    
    return {
      'package.json': JSON.stringify({
        name: projectName,
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint'
        },
        dependencies: {
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'next': '^14.0.0',
          'typescript': '^5.0.0',
          '@types/node': '^20.0.0',
          '@types/react': '^18.0.0',
          '@types/react-dom': '^18.0.0',
          'tailwindcss': '^3.4.0',
          'autoprefixer': '^10.4.0',
          'postcss': '^8.4.0'
        }
      }, null, 2),
      'README.md': `# ${project.name}\n\n${project.description}\n\n## Getting Started\n\n\`\`\`bash\nnpm run dev\n\`\`\`\n\nOpen [http://localhost:3000](http://localhost:3000) to view the application.`,
      'app/page.tsx': `export default function HomePage() {\n  return (\n    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">\n      <div className="container mx-auto px-4 py-16">\n        <div className="text-center">\n          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">\n            ${project.name}\n          </h1>\n          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">\n            ${project.description}\n          </p>\n        </div>\n      </div>\n    </main>\n  );\n}`,
      'app/layout.tsx': `import './globals.css'\nimport type { Metadata } from 'next'\n\nexport const metadata: Metadata = {\n  title: '${project.name}',\n  description: '${project.description}',\n}\n\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  )\n}`,
      'app/globals.css': `@tailwind base;\n@tailwind components;\n@tailwind utilities;`
    };
  };

  const handleFileSelect = (filePath: string) => {
    setCurrentFile(filePath);
    setCurrentCode(projectFiles[filePath] || '');
  };

  const handleCodeChange = (newCode: string) => {
    setCurrentCode(newCode);
    if (currentFile) {
      setProjectFiles(prev => ({
        ...prev,
        [currentFile]: newCode
      }));
    }
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
      const projectData = await templateService.createProjectFromTemplate(template.id, project?.name || 'New Project');
      setProjectFiles(projectData.files);
      setShowTemplateGallery(false);
      
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

  const handleRunProject = () => {
    setRightPanelTab('preview');
    toast({
      title: 'Starting preview',
      description: 'Launching development server...',
    });
  };

  if (isLoadingProject) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <div style={{'--i': 0} as React.CSSProperties}></div>
            <div style={{'--i': 1} as React.CSSProperties}></div>
            <div style={{'--i': 2} as React.CSSProperties}></div>
          </div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">The requested project could not be loaded</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (showTemplateGallery) {
    return (
      <div className="h-screen bg-background">
        <div className="border-b p-4 bg-background">
          <Button
            variant="ghost"
            onClick={() => setShowTemplateGallery(false)}
            className="mb-4"
          >
            ← Back to Project
          </Button>
        </div>
        <TemplateGallery onSelectTemplate={handleTemplateSelect} />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Enhanced Header */}
      <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <CodeIcon className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold">{project.name}</h1>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <div className="status-dot status-online mr-1"></div>
              {project.framework}
            </Badge>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 mr-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplateGallery(true)}
              className="text-muted-foreground"
            >
              <TemplateIcon className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </div>
          
          <Button variant="outline" size="sm">
            <SaveIcon className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button size="sm" onClick={handleRunProject}>
            <PlayIcon className="mr-2 h-4 w-4" />
            Run
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Enhanced Workspace */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel */}
          {showLeftPanel && (
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <div className="h-full border-r bg-background">
                <Tabs value={leftPanelTab} onValueChange={setLeftPanelTab} className="h-full flex flex-col">
                  <div className="border-b p-2">
                    <TabsList className="grid w-full grid-cols-4 h-8">
                      <TabsTrigger value="files" className="text-xs px-1">
                        <FolderIcon className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="git" className="text-xs px-1">
                        <GitBranchIcon className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="ai" className="text-xs px-1">
                        <SparklesIcon className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="terminal" className="text-xs px-1">
                        <TerminalIcon className="h-3 w-3" />
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="files" className="flex-1 p-0 m-0">
                    <FileExplorer 
                      onSelectFile={handleFileSelect} 
                      files={projectFiles}
                      currentFile={currentFile}
                    />
                  </TabsContent>
                  
                  <TabsContent value="git" className="flex-1 p-0 m-0">
                    <GitPanel projectId={project.id} />
                  </TabsContent>
                  
                  <TabsContent value="ai" className="flex-1 p-0 m-0">
                    <EnhancedCodeGeneration 
                      projectId={project.id} 
                      onCodeGenerated={handleCodeGenerated}
                    />
                  </TabsContent>
                  
                  <TabsContent value="terminal" className="flex-1 p-0 m-0">
                    <TerminalPanel projectId={project.id} />
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          )}

          <ResizableHandle withHandle />

          {/* Center Panel (Code Editor) */}
          <ResizablePanel defaultSize={showRightPanel ? 45 : 75}>
            <div className="h-full relative bg-background">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLeftPanel(!showLeftPanel)}
                  className="h-7 w-7 rounded-full bg-background shadow-sm border"
                >
                  <PanelLeftIcon className="h-3 w-3" />
                </Button>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className="h-7 w-7 rounded-full bg-background shadow-sm border"
                >
                  <PanelRightIcon className="h-3 w-3" />
                </Button>
              </div>
              
              {currentFile ? (
                <div className="h-full">
                  <CodeEditor 
                    filePath={currentFile} 
                    code={currentCode}
                    onChange={handleCodeChange}
                  />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-muted/20">
                  <div className="mb-6 rounded-full bg-muted p-4">
                    <CodeIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">Welcome to {project.name}</h3>
                  <p className="mb-8 text-muted-foreground max-w-md leading-relaxed">
                    Select a file from the explorer, generate code with AI, or choose a template to start coding
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => setLeftPanelTab('files')} variant="outline">
                      <FolderIcon className="mr-2 h-4 w-4" />
                      Browse Files
                    </Button>
                    <Button onClick={() => setLeftPanelTab('ai')}>
                      <SparklesIcon className="mr-2 h-4 w-4" />
                      Generate Code
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>

          {showRightPanel && (
            <>
              <ResizableHandle withHandle />
              
              {/* Right Panel */}
              <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
                <div className="h-full border-l bg-background">
                  <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="h-full flex flex-col">
                    <div className="border-b p-2">
                      <TabsList className="grid w-full grid-cols-4 h-8">
                        <TabsTrigger value="preview" className="text-xs px-1">
                          <MonitorIcon className="h-3 w-3" />
                        </TabsTrigger>
                        <TabsTrigger value="intelligence" className="text-xs px-1">
                          <BrainCircuitIcon className="h-3 w-3" />
                        </TabsTrigger>
                        <TabsTrigger value="agents" className="text-xs px-1">
                          <SparklesIcon className="h-3 w-3" />
                        </TabsTrigger>
                        <TabsTrigger value="collab" className="text-xs px-1">
                          <UsersIcon className="h-3 w-3" />
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="preview" className="flex-1 p-0 m-0">
                      <LivePreview projectId={project.id} files={projectFiles} />
                    </TabsContent>
                    
                    <TabsContent value="intelligence" className="flex-1 p-0 m-0">
                      <CodeIntelligencePanel 
                        currentFile={currentFile}
                        code={currentCode}
                        language="typescript"
                      />
                    </TabsContent>
                    
                    <TabsContent value="agents" className="flex-1 p-0 m-0">
                      <AgentPanel projectId={project.id} />
                    </TabsContent>
                    
                    <TabsContent value="collab" className="flex-1 p-0 m-0">
                      <CollaborationPanel 
                        projectId={project.id}
                        currentFile={currentFile}
                        userId={userId}
                        userName={userName}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}