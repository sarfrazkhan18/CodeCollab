'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/components/supabase-provider';
import { Clock, CodeIcon, Users2, ExternalLink } from 'lucide-react';
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
        // For demo purposes, we're using mock data
        setTimeout(() => {
          const mockProjects = [
            {
              id: '1',
              name: 'Instagram Clone',
              description: 'A social media app with photo sharing capabilities',
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              tech_stack: ['React', 'Supabase', 'Tailwind'],
              collaborators_count: 3,
              deployment_url: 'https://instagram-clone.vercel.app',
              status: 'active',
            },
            {
              id: '2',
              name: 'E-Commerce Dashboard',
              description: 'Admin panel for managing products and orders',
              created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              tech_stack: ['Next.js', 'FastAPI', 'PostgreSQL'],
              collaborators_count: 2,
              status: 'active',
            },
            {
              id: '3',
              name: 'Task Management App',
              description: 'Collaborative task management with real-time updates',
              created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              tech_stack: ['React', 'Node.js', 'MongoDB'],
              collaborators_count: 4,
              deployment_url: 'https://tasks-app.vercel.app',
              status: 'active',
            }
          ];
          setProjects(mockProjects);
          setIsLoading(false);
        }, 1000);
        
        // In production, you would use:
        // const { data, error } = await supabase
        //  .from('projects')
        //  .select('*')
        //  .order('created_at', { ascending: false });
        
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
          Create your first project to start collaborating with AI agents
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card 
          key={project.id} 
          className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
          onClick={() => router.push(`/project/${project.id}`)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{project.name}</CardTitle>
              {project.status === 'active' && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Active
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-1">{project.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tech_stack.map((tech) => (
                <Badge key={tech} variant="secondary" className="bg-secondary/50">
                  {tech}
                </Badge>
              ))}
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
                Live
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}