'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/components/supabase-provider';
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
  SparklesIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  tech_stack: string[];
  collaborators_count: number;
  deployment_url?: string;
  status: string;
  features: string[];
}

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        
        // This would be a real Supabase query in production
        // For demo purposes, we're using mock data with enhanced features
        setTimeout(() => {
          const mockProjects = [
            {
              id: '1',
              name: 'Instagram Clone',
              description: 'A social media app with photo sharing capabilities and real-time features',
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              tech_stack: ['React', 'Supabase', 'Tailwind'],
              collaborators_count: 3,
              deployment_url: 'https://instagram-clone.vercel.app',
              status: 'active',
              features: ['Code Intelligence', 'Real-time Collaboration', 'Smart Deployment']
            },
            {
              id: '2',
              name: 'E-Commerce Dashboard',
              description: 'Admin panel for managing products and orders with AI insights',
              created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              tech_stack: ['Next.js', 'FastAPI', 'PostgreSQL'],
              collaborators_count: 2,
              status: 'active',
              features: ['AI Code Generation', 'Git Integration', 'Terminal Access']
            },
            {
              id: '3',
              name: 'Task Management App',
              description: 'Collaborative task management with real-time updates and AI assistance',
              created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              tech_stack: ['React', 'Node.js', 'MongoDB'],
              collaborators_count: 4,
              deployment_url: 'https://tasks-app.vercel.app',
              status: 'active',
              features: ['All Features Available']
            }
          ];
          setProjects(mockProjects);
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

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
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {project.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                {project.status === 'active' && (
                  <Badge variant="outline\" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Active
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenProject(project.id);
                  }}
                >
                  <PlayIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="bg-secondary/50">
                    {tech}
                  </Badge>
                ))}
              </div>

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
              <Users2 className="h-3 w-3 mr-1" />
              {project.collaborators_count} {project.collaborators_count === 1 ? 'member' : 'members'}
            </div>
            {project.deployment_url && (
              <div className="flex items-center">
                <ExternalLink className="h-3 w-3 mr-1" />
                <a 
                  href={project.deployment_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Live
                </a>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}