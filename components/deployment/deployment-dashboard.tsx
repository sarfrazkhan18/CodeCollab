'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  RocketIcon,
  ExternalLinkIcon,
  SettingsIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  GlobeIcon,
  GitBranchIcon
} from 'lucide-react';
import { deploymentService, DeploymentProvider, DeploymentConfig, DeploymentStatus } from '@/lib/deployment/deployment-service';
import { useToast } from '@/hooks/use-toast';

interface DeploymentDashboardProps {
  projectId: string;
  projectName: string;
}

export function DeploymentDashboard({ projectId, projectName }: DeploymentDashboardProps) {
  const [providers, setProviders] = useState<DeploymentProvider[]>([]);
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [deploymentConfig, setDeploymentConfig] = useState<Partial<DeploymentConfig>>({
    framework: 'Next.js',
    buildCommand: 'npm run build',
    outputDirectory: 'out',
    environmentVariables: {},
    branch: 'main'
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeDeployment, setActiveDeployment] = useState<DeploymentStatus | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const allProviders = deploymentService.getProviders();
    setProviders(allProviders);
    setSelectedProvider(allProviders[0]?.id || '');
    loadDeployments();
  }, [projectId]);

  useEffect(() => {
    if (selectedProvider) {
      generateConfig();
    }
  }, [selectedProvider, deploymentConfig.framework]);

  const loadDeployments = async () => {
    try {
      const projectDeployments = await deploymentService.getProjectDeployments(projectId);
      setDeployments(projectDeployments);
    } catch (error) {
      console.error('Failed to load deployments:', error);
    }
  };

  const generateConfig = async () => {
    if (!selectedProvider || !deploymentConfig.framework) return;

    try {
      const config = await deploymentService.generateDeploymentConfig(
        deploymentConfig.framework,
        selectedProvider
      );
      setDeploymentConfig(prev => ({ ...prev, ...config }));
    } catch (error) {
      console.error('Failed to generate config:', error);
    }
  };

  const handleDeploy = async () => {
    if (!selectedProvider) {
      toast({
        title: 'Provider required',
        description: 'Please select a deployment provider',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsDeploying(true);
      
      const config: DeploymentConfig = {
        provider: selectedProvider,
        framework: deploymentConfig.framework || 'Next.js',
        buildCommand: deploymentConfig.buildCommand || 'npm run build',
        outputDirectory: deploymentConfig.outputDirectory || 'out',
        environmentVariables: deploymentConfig.environmentVariables || {},
        branch: deploymentConfig.branch || 'main'
      };

      const deployment = await deploymentService.deploy(projectId, config);
      setActiveDeployment(deployment);
      
      toast({
        title: 'Deployment started',
        description: `Deploying ${projectName} to ${selectedProvider}`,
      });

      // Poll for deployment status
      const pollInterval = setInterval(async () => {
        const status = await deploymentService.getDeploymentStatus(deployment.id);
        if (status) {
          setActiveDeployment(status);
          if (status.status === 'deployed' || status.status === 'failed') {
            clearInterval(pollInterval);
            setIsDeploying(false);
            loadDeployments();
            
            if (status.status === 'deployed') {
              toast({
                title: 'Deployment successful',
                description: `Your project is now live at ${status.url}`,
              });
            } else {
              toast({
                title: 'Deployment failed',
                description: 'Check the logs for more details',
                variant: 'destructive',
              });
            }
          }
        }
      }, 2000);

    } catch (error) {
      setIsDeploying(false);
      toast({
        title: 'Deployment failed',
        description: 'Failed to start deployment',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'building':
        return <AlertCircleIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'building':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-6">
        <h2 className="text-2xl font-bold mb-2">Deployment Dashboard</h2>
        <p className="text-muted-foreground">
          Deploy {projectName} to your favorite hosting platform
        </p>
      </div>

      <Tabs defaultValue="deploy" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="flex-1 p-6 space-y-6">
          {/* Provider Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RocketIcon className="h-5 w-5" />
                Choose Deployment Provider
              </CardTitle>
              <CardDescription>
                Select where you want to deploy your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider) => (
                  <Card
                    key={provider.id}
                    className={`cursor-pointer transition-all ${
                      selectedProvider === provider.id
                        ? 'ring-2 ring-primary'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedProvider(provider.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{provider.icon}</span>
                        <div>
                          <h3 className="font-semibold">{provider.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {provider.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {provider.features.slice(0, 2).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Deployment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="framework">Framework</Label>
                  <Select
                    value={deploymentConfig.framework}
                    onValueChange={(value) =>
                      setDeploymentConfig(prev => ({ ...prev, framework: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Next.js">Next.js</SelectItem>
                      <SelectItem value="React">React</SelectItem>
                      <SelectItem value="Vue">Vue</SelectItem>
                      <SelectItem value="Static">Static HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    value={deploymentConfig.branch}
                    onChange={(e) =>
                      setDeploymentConfig(prev => ({ ...prev, branch: e.target.value }))
                    }
                    placeholder="main"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buildCommand">Build Command</Label>
                  <Input
                    id="buildCommand"
                    value={deploymentConfig.buildCommand}
                    onChange={(e) =>
                      setDeploymentConfig(prev => ({ ...prev, buildCommand: e.target.value }))
                    }
                    placeholder="npm run build"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outputDirectory">Output Directory</Label>
                  <Input
                    id="outputDirectory"
                    value={deploymentConfig.outputDirectory}
                    onChange={(e) =>
                      setDeploymentConfig(prev => ({ ...prev, outputDirectory: e.target.value }))
                    }
                    placeholder="out"
                  />
                </div>
              </div>

              <Button
                onClick={handleDeploy}
                disabled={isDeploying || !selectedProvider}
                className="w-full"
                size="lg"
              >
                {isDeploying ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <RocketIcon className="h-4 w-4 mr-2" />
                    Deploy to {providers.find(p => p.id === selectedProvider)?.name}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Active Deployment */}
          {activeDeployment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(activeDeployment.status)}
                  Deployment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge variant="outline" className={getStatusColor(activeDeployment.status)}>
                      {activeDeployment.status}
                    </Badge>
                  </div>

                  {activeDeployment.status === 'building' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Building...</span>
                        <span>Please wait</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                  )}

                  {activeDeployment.url && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">Live URL:</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={activeDeployment.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLinkIcon className="h-4 w-4 mr-2" />
                          Visit Site
                        </a>
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium">Deployment Logs</h4>
                    <ScrollArea className="h-32 w-full border rounded-md p-3">
                      <div className="space-y-1">
                        {activeDeployment.logs.map((log, index) => (
                          <div key={index} className="text-sm font-mono">
                            {log}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="flex-1 p-6">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {deployments.length > 0 ? (
                deployments.map((deployment) => (
                  <Card key={deployment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(deployment.status)}
                          <div>
                            <p className="font-medium">
                              Deployment #{deployment.id.split('-').pop()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {deployment.createdAt.toLocaleDateString()} at{' '}
                              {deployment.createdAt.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusColor(deployment.status)}>
                            {deployment.status}
                          </Badge>
                          {deployment.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLinkIcon className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <RocketIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No deployments yet</h3>
                  <p className="text-muted-foreground">
                    Deploy your project to see deployment history
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Settings</CardTitle>
              <CardDescription>
                Configure default settings for your deployments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain</Label>
                <Input
                  id="customDomain"
                  placeholder="example.com"
                  value={deploymentConfig.customDomain || ''}
                  onChange={(e) =>
                    setDeploymentConfig(prev => ({ ...prev, customDomain: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Environment Variables</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Variable name" />
                    <Input placeholder="Variable value" />
                  </div>
                  <Button variant="outline" size="sm">
                    Add Variable
                  </Button>
                </div>
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}