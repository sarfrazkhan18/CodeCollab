'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  CodeIcon, 
  Users2, 
  ExternalLink, 
  PlayIcon, 
  BrainCircuitIcon,
  RocketIcon,
  GitBranchIcon,
  TerminalIcon,
  SparklesIcon,
  TrashIcon,
  MoreVerticalIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  framework: string;
  template?: string;
  files: Record<string, string>;
  features: string[];
}

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    try {
      setIsLoading(true);
      
      // Load projects from localStorage
      const storedProjects = JSON.parse(localStorage.getItem('codecollab_projects') || '[]');
      
      // Add demo projects if no projects exist
      if (storedProjects.length === 0) {
        const demoProjects = [
          {
            id: 'demo-instagram',
            name: 'Instagram Clone',
            description: 'A social media app with photo sharing capabilities and real-time features',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            framework: 'react',
            template: 'social-media',
            files: {},
            features: ['Code Intelligence', 'Real-time Collaboration', 'Smart Deployment']
          },
          {
            id: 'demo-ecommerce',
            name: 'E-Commerce Dashboard',
            description: 'Admin panel for managing products and orders with AI insights',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            framework: 'react',
            template: 'ecommerce-store',
            files: {},
            features: ['AI Code Generation', 'Git Integration', 'Terminal Access']
          },
          {
            id: 'demo-tasks',
            name: 'Task Management App',
            description: 'Collaborative task management with real-time updates and AI assistance',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            framework: 'react',
            template: 'task-manager',
            files: {},
            features: ['All Features Available']
          }
        ];
        
        setProjects([...storedProjects, ...demoProjects]);
      } else {
        setProjects(storedProjects);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const deleteProject = (projectId: string) => {
    try {
      const storedProjects = JSON.parse(localStorage.getItem('codecollab_projects') || '[]');
      const updatedProjects = storedProjects.filter((p: Project) => p.id !== projectId);
      localStorage.setItem('codecollab_projects', JSON.stringify(updatedProjects));
      
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      toast({
        title: 'Project deleted',
        description: 'Project has been removed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'Code Intelligence':
        return <BrainCircuitIcon className="h-3 w-3" />;
      case 'Real-time Collaboration':
        return <Users2 className="h-3 w-3" />;
      case 'Smart Deployment':
        return <RocketIcon className="h-3 w-3" />;
      case 'AI Code Generation':
        return <SparklesIcon className="h-3 w-3" />;
      case 'Git Integration':
        return <GitBranchIcon className="h-3 w-3" />;
      case 'Terminal Access':
        return <TerminalIcon className="h-3 w-3" />;
      default:
        return <CodeIcon className="h-3 w-3" />;
    }
  };

  const getFrameworkBadge = (framework: string) => {
    const colors = {
      react: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      vue: 'bg-green-500/10 text-green-500 border-green-500/20',
      angular: 'bg-red-500/10 text-red-500 border-red-500/20',
      svelte: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    };
    
    return colors[framework as keyof typeof colors] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/project/${projectId}`);
    toast({
      title: 'Opening project',
      description: 'Loading enhanced workspace with all features...',
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <CodeIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">No projects yet</h3>
        <p className="mb-6 text-muted-foreground max-w-md">
          Create your first project to start using AI-powered development features
        </p>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/demo')}>
            <PlayIcon className="h-4 w-4 mr-2" />
            Try Demo First
          </Button>
          <Button variant="outline">
            <CodeIcon className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card 
          key={project.id} 
          className="overflow-hidden transition-all hover:shadow-md cursor-pointer group"
          onClick={() => handleOpenProject(project.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {project.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getFrameworkBadge(project.framework)}>
                    {project.framework}
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Active
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleOpenProject(project.id);
                  }}>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Open Project
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                    className="text-red-600"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription className="line-clamp-2 mt-2">{project.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* Available Features */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Available Features:</h4>
                <div className="flex flex-wrap gap-2">
                  {project.features.map((feature) => (
                    <Badge 
                      key={feature} 
                      variant="outline" 
                      className="text-xs bg-primary/5 border-primary/20 text-primary"
                    >
                      {getFeatureIcon(feature)}
                      <span className="ml-1">{feature}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between text-sm text-muted-foreground border-t pt-4">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </div>
            <div className="flex items-center">
              <span className="text-xs">Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}