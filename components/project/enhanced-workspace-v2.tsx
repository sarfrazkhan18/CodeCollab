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
  const [rightPanelTab, setRightPanelTab] = useState('intelligence');
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>({});
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Mock user data - in production this would come from auth
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
      
      // If not found in localStorage, check for demo projects
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
      'README.md': `# ${project.name}

${project.description}

## Getting Started

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- ⚡ Next.js 14 with App Router
- 🎨 Tailwind CSS for styling
- 📝 TypeScript for type safety
- 🤖 AI-powered development with CodeCollab AI

## Tech Stack

- Framework: ${project.framework}
- Language: TypeScript
- Styling: Tailwind CSS
- Deployment: Ready for Vercel/Netlify
`,
      'app/page.tsx': `export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            ${project.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            ${project.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Get Started
            </button>
            <button className="border border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors">
              Learn More
            </button>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">🚀 Fast Development</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Build faster with AI-powered code generation and intelligent suggestions.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">🤝 Collaboration</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Work together in real-time with live cursors and instant updates.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">📦 Ready to Deploy</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Deploy instantly to Vercel, Netlify, or your preferred platform.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}`,
      'app/layout.tsx': `import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${project.name}',
  description: '${project.description}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,
      'app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`,
      'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}`
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
    if (currentFile && project) {
      // Update project in localStorage
      const storedProjects = JSON.parse(localStorage.getItem('codecollab_projects') || '[]');
      const updatedProjects = storedProjects.map((p: Project) => 
        p.id === project.id 
          ? { ...p, files: projectFiles, updated_at: new Date().toISOString() }
          : p
      );
      localStorage.setItem('codecollab_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: 'File saved',
        description: `Saved ${currentFile}`,
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
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
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
      <div className="h-screen">
        <div className="border-b p-4">
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
          <h1 className="text-lg font-semibold">{project.name}</h1>
          <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-500 border-green-500/20">
            {project.framework}
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
                  <FileExplorer 
                    onSelectFile={handleFileSelect} 
                    files={projectFiles}
                    currentFile={currentFile}
                  />
                </TabsContent>
                
                <TabsContent value="git" className="flex-1 p-0">
                  <GitPanel projectId={project.id} />
                </TabsContent>
                
                <TabsContent value="ai" className="flex-1 p-0">
                  <EnhancedCodeGeneration 
                    projectId={project.id} 
                    onCodeGenerated={handleCodeGenerated}
                  />
                </TabsContent>
                
                <TabsContent value="terminal" className="flex-1 p-0">
                  <TerminalPanel projectId={project.id} />
                </TabsContent>
                
                <TabsContent value="deploy" className="flex-1 p-0">
                  <DeploymentDashboard projectId={project.id} projectName={project.name} />
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
                <CodeEditor 
                  filePath={currentFile} 
                  code={currentCode}
                  onChange={handleCodeChange}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 rounded-full bg-muted p-3">
                    <CodeIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Welcome to {project.name}</h3>
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
                    <LivePreview projectId={project.id} files={projectFiles} />
                  </TabsContent>
                  
                  <TabsContent value="agents" className="flex-1 p-0">
                    <AgentPanel projectId={project.id} />
                  </TabsContent>
                  
                  <TabsContent value="collab" className="flex-1 p-0">
                    <CollaborationPanel 
                      projectId={project.id}
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