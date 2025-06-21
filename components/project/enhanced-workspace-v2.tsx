'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AgenticCanvas } from './agentic-canvas';
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
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>({});
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setIsLoadingProject(true);
      
      const storedProjects = JSON.parse(localStorage.getItem('codecollab_projects') || '[]');
      let foundProject = storedProjects.find((p: Project) => p.id === projectId);
      
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
      
      if (!foundProject.files || Object.keys(foundProject.files).length === 0) {
        const initialFiles = createInitialProjectFiles(foundProject);
        foundProject.files = initialFiles;
        
        if (storedProjects.some((p: Project) => p.id === projectId)) {
          const updatedProjects = storedProjects.map((p: Project) => 
            p.id === projectId ? foundProject : p
          );
          localStorage.setItem('codecollab_projects', JSON.stringify(updatedProjects));
        }
      }
      
      setProjectFiles(foundProject.files);
      
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
      'app/page.tsx': `export default function HomePage() {\n  return (\n    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">\n      <div className="container mx-auto px-4 py-16">\n        <div className="text-center">\n          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">\n            ${project.name}\n          </h1>\n          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">\n            ${project.description}\n          </p>\n          <div className="flex justify-center gap-4">\n            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">\n              Get Started\n            </button>\n            <button className="border border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors">\n              Learn More\n            </button>\n          </div>\n        </div>\n      </div>\n    </main>\n  );\n}`,
      'app/layout.tsx': `import './globals.css'\nimport type { Metadata } from 'next'\n\nexport const metadata: Metadata = {\n  title: '${project.name}',\n  description: '${project.description}',\n}\n\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  )\n}`,
      'app/globals.css': `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n@layer base {\n  :root {\n    --background: 0 0% 100%;\n    --foreground: 222.2 84% 4.9%;\n    --primary: 221.2 83.2% 53.3%;\n    --primary-foreground: 210 40% 98%;\n  }\n  \n  .dark {\n    --background: 222.2 84% 4.9%;\n    --foreground: 210 40% 98%;\n    --primary: 217.2 91.2% 59.8%;\n    --primary-foreground: 222.2 84% 4.9%;\n  }\n}\n\n@layer base {\n  body {\n    @apply bg-background text-foreground;\n  }\n}`
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
      saveProjectFiles({
        ...projectFiles,
        [currentFile]: newCode
      });
    }
  };

  const handleCodeGenerated = (code: string, filePath: string) => {
    const updatedFiles = {
      ...projectFiles,
      [filePath]: code
    };
    setProjectFiles(updatedFiles);
    setCurrentFile(filePath);
    setCurrentCode(code);
    saveProjectFiles(updatedFiles);
  };

  const handleFileCreated = (filePath: string, content: string) => {
    const updatedFiles = {
      ...projectFiles,
      [filePath]: content
    };
    setProjectFiles(updatedFiles);
    saveProjectFiles(updatedFiles);
    
    // Auto-select the new file
    setCurrentFile(filePath);
    setCurrentCode(content);
  };

  const handleFileDeleted = (filePath: string) => {
    const updatedFiles = { ...projectFiles };
    delete updatedFiles[filePath];
    setProjectFiles(updatedFiles);
    saveProjectFiles(updatedFiles);
    
    // If the deleted file was currently open, close it
    if (currentFile === filePath) {
      const remainingFiles = Object.keys(updatedFiles);
      if (remainingFiles.length > 0) {
        setCurrentFile(remainingFiles[0]);
        setCurrentCode(updatedFiles[remainingFiles[0]] || '');
      } else {
        setCurrentFile(null);
        setCurrentCode('');
      }
    }
  };

  const handleFileRenamed = (oldPath: string, newPath: string) => {
    const updatedFiles = { ...projectFiles };
    const content = updatedFiles[oldPath];
    delete updatedFiles[oldPath];
    updatedFiles[newPath] = content;
    setProjectFiles(updatedFiles);
    saveProjectFiles(updatedFiles);
    
    // If the renamed file was currently open, update the current file path
    if (currentFile === oldPath) {
      setCurrentFile(newPath);
    }
  };

  const saveProjectFiles = (files: Record<string, string>) => {
    if (!project) return;
    
    try {
      const storedProjects = JSON.parse(localStorage.getItem('codecollab_projects') || '[]');
      const updatedProjects = storedProjects.map((p: Project) => 
        p.id === project.id 
          ? { ...p, files, updated_at: new Date().toISOString() }
          : p
      );
      localStorage.setItem('codecollab_projects', JSON.stringify(updatedProjects));
    } catch (error) {
      console.error('Error saving project files:', error);
    }
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
      
      saveProjectFiles(projectData.files);
      
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
          <button onClick={() => router.push('/dashboard')} className="dev-button-primary">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showTemplateGallery) {
    return (
      <div className="h-screen bg-background">
        <div className="border-b p-4 bg-background">
          <button
            onClick={() => setShowTemplateGallery(false)}
            className="mb-4 dev-button-secondary"
          >
            ← Back to Project
          </button>
        </div>
        <TemplateGallery onSelectTemplate={handleTemplateSelect} />
      </div>
    );
  }

  return (
    <AgenticCanvas
      projectId={projectId}
      project={project}
      projectFiles={projectFiles}
      currentFile={currentFile}
      currentCode={currentCode}
      onFileSelect={handleFileSelect}
      onCodeChange={handleCodeChange}
      onCodeGenerated={handleCodeGenerated}
      onFileCreated={handleFileCreated}
      onFileDeleted={handleFileDeleted}
      onFileRenamed={handleFileRenamed}
    />
  );
}