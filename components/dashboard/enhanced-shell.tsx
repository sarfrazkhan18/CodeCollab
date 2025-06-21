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
  ZapIcon,
  StarIcon,
  ClockIcon
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
      const projectData = await templateService.createProjectFromTemplate(template.id, template.name);
      
      toast({
        title: 'Project created from template',
        description: `${template.name} project is ready to use`,
      });
      
      router.push('/project/template-' + template.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project from template',
        variant: 'destructive',
      });
    }
  };

  const quickActions = [
    {
      title: 'New Project',
      description: 'Start from scratch',
      icon: <PlusIcon className="h-5 w-5" />,
      action: () => setIsCreateDialogOpen(true),
      color: 'bg-primary text-primary-foreground',
      shortcut: 'Ctrl+N'
    },
    {
      title: 'Use Template',
      description: 'Quick start with templates',
      icon: <TemplateIcon className="h-5 w-5" />,
      action: () => setShowTemplateGallery(true),
      color: 'bg-green-500 text-white',
      shortcut: 'Ctrl+T'
    },
    {
      title: 'Try Demo',
      description: 'Interactive experience',
      icon: <PlayIcon className="h-5 w-5" />,
      action: () => router.push('/demo'),
      color: 'bg-blue-500 text-white',
      shortcut: 'Ctrl+D'
    }
  ];

  const features = [
    {
      title: 'AI Code Assistant',
      description: 'Get intelligent code suggestions and automated refactoring',
      icon: <BrainCircuitIcon className="h-5 w-5" />,
      status: 'Available',
      color: 'text-green-500'
    },
    {
      title: 'Real-time Collaboration',
      description: 'Work together with live cursors and comments',
      icon: <UsersIcon className="h-5 w-5" />,
      status: 'Available',
      color: 'text-green-500'
    },
    {
      title: 'One-click Deploy',
      description: 'Deploy to multiple platforms instantly',
      icon: <RocketIcon className="h-5 w-5" />,
      status: 'Available',
      color: 'text-green-500'
    },
    {
      title: 'Git Integration',
      description: 'Visual git interface with smart merging',
      icon: <GitBranchIcon className="h-5 w-5" />,
      status: 'Available',
      color: 'text-green-500'
    }
  ];

  if (showTemplateGallery) {
    return (
      <div className="h-screen bg-background">
        <div className="border-b p-4 bg-background">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setShowTemplateGallery(false)}
              className="flex items-center gap-2"
            >
              ← Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline">50+ Templates</Badge>
            </div>
          </div>
        </div>
        <TemplateGallery onSelectTemplate={handleTemplateSelect} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <CodeIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold">CodeCollab AI</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="hidden sm:flex"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Project
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground"
            >
              <LogOutIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="container max-w-7xl py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  Welcome back, {user?.email?.split('@')[0] || 'Developer'}
                </h2>
                <p className="text-muted-foreground">
                  Ready to build something amazing? Let's get started.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <div className="status-dot status-online mr-2"></div>
                  All Systems Operational
                </Badge>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {quickActions.map((action, index) => (
                <Card 
                  key={index}
                  className="dev-card cursor-pointer group hover:scale-[1.02] transition-all"
                  onClick={action.action}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                        <p className="text-xs text-muted-foreground mt-1 opacity-60">
                          {action.shortcut}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FolderIcon className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <TemplateIcon className="h-4 w-4" />
                Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Your Projects</h3>
                  <p className="text-muted-foreground">Manage and access your development projects</p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
              <ProjectsList />
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Platform Features</h3>
                <p className="text-muted-foreground">Explore the powerful tools available in your workspace</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className="dev-card">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg text-primary">
                            {feature.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                            <CardDescription>{feature.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className={`${feature.color} border-current/20 bg-current/10`}>
                          {feature.status}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <Card className="dev-card bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary rounded-lg text-primary-foreground">
                      <BrainCircuitIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">Start Building with AI</h3>
                      <p className="text-muted-foreground mb-4">
                        Experience the future of development with intelligent AI agents that understand your code
                      </p>
                      <div className="flex gap-3">
                        <Button onClick={() => router.push('/demo')}>
                          <PlayIcon className="h-4 w-4 mr-2" />
                          Try Demo
                        </Button>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
                          Start Project
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Project Templates</h3>
                  <p className="text-muted-foreground">Jump-start your development with production-ready templates</p>
                </div>
                <Button variant="outline" onClick={() => setShowTemplateGallery(true)}>
                  View All Templates
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templateService.getTemplates().slice(0, 6).map((template) => (
                  <Card 
                    key={template.id}
                    className="dev-card cursor-pointer group hover:scale-[1.02] transition-all"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {template.estimatedTime}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {template.difficulty}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateProjectDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
}