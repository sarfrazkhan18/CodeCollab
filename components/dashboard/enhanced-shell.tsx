'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CodeIcon, 
  PlusIcon, 
  FolderIcon, 
  SettingsIcon, 
  LogOutIcon,
  LayoutDashboardIcon,
  SparklesIcon,
  BrainCircuitIcon,
  RocketIcon,
  UsersIcon,
  BookTemplateIcon as TemplateIcon,
  TrendingUpIcon,
  PlayIcon,
  GitBranchIcon,
  TerminalIcon,
  MonitorIcon,
  ZapIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectsList } from '@/components/dashboard/projects-list';
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog';
import { TemplateGallery } from '@/components/templates/template-gallery';
import { useSupabase } from '@/components/supabase-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { templateService, ProjectTemplate } from '@/lib/templates/project-templates';
import { useToast } from '@/hooks/use-toast';

export function EnhancedDashboardShell() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const { signOut, user } = useSupabase();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleTemplateSelect = async (template: ProjectTemplate) => {
    try {
      // Create project from template
      const projectData = await templateService.createProjectFromTemplate(template.id, template.name);
      
      toast({
        title: 'Project created from template',
        description: `${template.name} project is ready to use`,
      });
      
      // Navigate to the new project
      router.push('/project/template-' + template.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project from template',
        variant: 'destructive',
      });
    }
  };

  const features = [
    {
      title: 'Code Intelligence',
      description: 'AI-powered code analysis, refactoring, and documentation',
      icon: <BrainCircuitIcon className="h-6 w-6" />,
      color: 'from-blue-500 to-purple-600',
      action: () => {
        toast({
          title: 'Code Intelligence',
          description: 'Available in the workspace - create or open a project to access',
        });
        setActiveTab('projects');
      },
      features: ['Real-time code analysis', 'Intelligent refactoring', 'Auto documentation', 'Security scanning']
    },
    {
      title: 'Project Templates',
      description: 'Production-ready templates for rapid development',
      icon: <TemplateIcon className="h-6 w-6" />,
      color: 'from-green-500 to-teal-600',
      action: () => setShowTemplateGallery(true),
      features: ['React dashboards', 'E-commerce stores', 'AI chatbots', 'Full-stack apps']
    },
    {
      title: 'Smart Deployment',
      description: 'One-click deployment to Vercel, Netlify, and more',
      icon: <RocketIcon className="h-6 w-6" />,
      color: 'from-orange-500 to-red-600',
      action: () => {
        toast({
          title: 'Smart Deployment',
          description: 'Available in project workspace - deploy with one click',
        });
        setActiveTab('projects');
      },
      features: ['Auto configuration', 'Multiple providers', 'Custom domains', 'Environment variables']
    },
    {
      title: 'Real-time Collaboration',
      description: 'Live cursors, comments, and team presence',
      icon: <UsersIcon className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-600',
      action: () => {
        toast({
          title: 'Real-time Collaboration',
          description: 'Available in project workspace - collaborate with your team',
        });
        setActiveTab('projects');
      },
      features: ['Live cursors', 'Inline comments', 'Team presence', 'Conflict resolution']
    },
    {
      title: 'AI Code Generation',
      description: 'Generate complete components, functions, and tests',
      icon: <SparklesIcon className="h-6 w-6" />,
      color: 'from-indigo-500 to-blue-600',
      action: () => {
        toast({
          title: 'AI Code Generation',
          description: 'Available in project workspace - generate code with AI',
        });
        setActiveTab('projects');
      },
      features: ['Component generation', 'Test creation', 'API endpoints', 'Documentation']
    },
    {
      title: 'Git Integration',
      description: 'Visual git interface with branch management',
      icon: <GitBranchIcon className="h-6 w-6" />,
      color: 'from-gray-600 to-gray-800',
      action: () => {
        toast({
          title: 'Git Integration',
          description: 'Available in project workspace - manage your code with git',
        });
        setActiveTab('projects');
      },
      features: ['Visual git interface', 'Branch management', 'Merge conflicts', 'Commit history']
    }
  ];

  const quickActions = [
    {
      title: 'Try Interactive Demo',
      description: 'Experience AI-powered coding',
      icon: <PlayIcon className="h-5 w-5" />,
      action: () => router.push('/demo'),
      color: 'bg-blue-500'
    },
    {
      title: 'Browse Templates',
      description: 'Start with a template',
      icon: <TemplateIcon className="h-5 w-5" />,
      action: () => setShowTemplateGallery(true),
      color: 'bg-green-500'
    },
    {
      title: 'Create Blank Project',
      description: 'Start from scratch',
      icon: <PlusIcon className="h-5 w-5" />,
      action: () => setIsCreateDialogOpen(true),
      color: 'bg-purple-500'
    }
  ];

  if (showTemplateGallery) {
    return (
      <div className="h-screen">
        <div className="border-b p-4">
          <Button
            variant="ghost"
            onClick={() => setShowTemplateGallery(false)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <TemplateGallery onSelectTemplate={handleTemplateSelect} />
      </div>
    );
  }

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
              <Button 
                variant={activeTab === 'projects' ? 'secondary' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('projects')}
              >
                <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                Projects
              </Button>
              <Button 
                variant={activeTab === 'features' ? 'secondary' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('features')}
              >
                <SparklesIcon className="mr-2 h-4 w-4" />
                Features
              </Button>
              <Button 
                variant={activeTab === 'templates' ? 'secondary' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('templates')}
              >
                <TemplateIcon className="mr-2 h-4 w-4" />
                Templates
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
          <div className="mb-2 text-sm text-muted-foreground">
            Welcome, {user?.email?.split('@')[0] || 'User'}
          </div>
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
            <h1 className="text-lg font-semibold md:text-xl">
              {activeTab === 'projects' && 'Your Projects'}
              {activeTab === 'features' && 'Platform Features'}
              {activeTab === 'templates' && 'Project Templates'}
            </h1>
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
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={action.action}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${action.color} text-white`}>
                          {action.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Projects List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Recent Projects</h2>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>
                <ProjectsList />
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Powerful Development Features</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Discover the advanced features available in your CodeCollab AI workspace
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card 
                    key={index}
                    className="hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    onClick={feature.action}
                  >
                    <CardHeader>
                      <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white`}>
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.features.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full mt-4" variant="outline">
                        <ZapIcon className="h-4 w-4 mr-2" />
                        Try Feature
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Feature Highlight */}
              <Card className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500 rounded-lg text-white">
                      <BrainCircuitIcon className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">AI-Powered Development</h3>
                      <p className="text-muted-foreground mb-4">
                        Experience the future of coding with intelligent AI agents that understand your code, 
                        suggest improvements, and help you build faster.
                      </p>
                      <div className="flex gap-2">
                        <Button onClick={() => router.push('/demo')}>
                          <PlayIcon className="h-4 w-4 mr-2" />
                          Try Interactive Demo
                        </Button>
                        <Button variant="outline" onClick={() => setActiveTab('projects')}>
                          Start Building
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Project Templates</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Jump-start your development with our curated collection of production-ready templates
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templateService.getTemplates().slice(0, 6).map((template) => (
                  <Card 
                    key={template.id}
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setShowTemplateGallery(true)}
                >
                  View All Templates
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      <CreateProjectDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
}