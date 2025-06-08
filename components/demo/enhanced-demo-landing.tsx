'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  BrainCircuitIcon, 
  CodeIcon, 
  RocketIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  PlayIcon, 
  SaveIcon, 
  Wand2Icon,
  SparklesIcon,
  UsersIcon,
  MonitorIcon,
  GitBranchIcon,
  TerminalIcon,
  BookTemplateIcon as TemplateIcon,
  TrendingUpIcon,
  ShieldIcon,
  ZapIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Editor } from '@monaco-editor/react';

interface AgentUpdate {
  agent: string;
  message: string;
  timestamp: Date;
  type: 'suggestion' | 'improvement' | 'analysis' | 'deployment' | 'collaboration';
  status: 'success' | 'error' | 'pending';
}

interface DemoFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  demo: () => Promise<void>;
}

export function EnhancedDemoLanding() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [updates, setUpdates] = useState<AgentUpdate[]>([]);
  const [userCode, setUserCode] = useState(`interface UserProfileProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

function UserProfile({ user }: UserProfileProps) {
  // Add your component logic here
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}`);
  const [task, setTask] = useState('');
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [codeMetrics, setCodeMetrics] = useState({
    complexity: 0,
    maintainability: 0,
    performance: 0,
    security: 0
  });
  const { toast } = useToast();

  const demoFeatures: DemoFeature[] = [
    {
      id: 'intelligence',
      name: 'Code Intelligence',
      description: 'AI-powered code analysis, refactoring, and documentation generation',
      icon: <BrainCircuitIcon className="h-6 w-6" />,
      color: 'from-blue-500 to-purple-600',
      demo: async () => {
        setActiveFeature('intelligence');
        addUpdate({
          agent: 'Code Intelligence',
          message: 'Analyzing code quality and patterns...',
          type: 'analysis',
          status: 'pending'
        });

        // Simulate code analysis
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setCodeMetrics({
          complexity: 75,
          maintainability: 85,
          performance: 80,
          security: 90
        });

        addUpdate({
          agent: 'Code Intelligence',
          message: 'Analysis complete! Found 3 improvement opportunities and generated refactoring suggestions.',
          type: 'analysis',
          status: 'success'
        });
      }
    },
    {
      id: 'templates',
      name: 'Project Templates',
      description: 'Production-ready templates for rapid development',
      icon: <TemplateIcon className="h-6 w-6" />,
      color: 'from-green-500 to-teal-600',
      demo: async () => {
        setActiveFeature('templates');
        addUpdate({
          agent: 'Template Engine',
          message: 'Loading curated project templates...',
          type: 'suggestion',
          status: 'pending'
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        addUpdate({
          agent: 'Template Engine',
          message: 'Found 12 templates: React Dashboard, E-commerce Store, AI Chatbot, and more!',
          type: 'suggestion',
          status: 'success'
        });
      }
    },
    {
      id: 'deployment',
      name: 'Smart Deployment',
      description: 'One-click deployment to Vercel, Netlify, and more',
      icon: <RocketIcon className="h-6 w-6" />,
      color: 'from-orange-500 to-red-600',
      demo: async () => {
        setActiveFeature('deployment');
        addUpdate({
          agent: 'Deployment Manager',
          message: 'Configuring deployment for Vercel...',
          type: 'deployment',
          status: 'pending'
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        addUpdate({
          agent: 'Deployment Manager',
          message: 'Deployment successful! Your app is live at https://my-app.vercel.app',
          type: 'deployment',
          status: 'success'
        });
      }
    },
    {
      id: 'collaboration',
      name: 'Real-time Collaboration',
      description: 'Live cursors, comments, and team presence',
      icon: <UsersIcon className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-600',
      demo: async () => {
        setActiveFeature('collaboration');
        addUpdate({
          agent: 'Collaboration Hub',
          message: 'Alice joined the project and is viewing App.tsx',
          type: 'collaboration',
          status: 'success'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        addUpdate({
          agent: 'Collaboration Hub',
          message: 'Bob added a comment: "Great work on the user interface!"',
          type: 'collaboration',
          status: 'success'
        });
      }
    }
  ];

  const addUpdate = (update: Omit<AgentUpdate, 'timestamp'>) => {
    setUpdates(prev => [...prev, { ...update, timestamp: new Date() }]);
  };

  const handleAPIError = (error: any) => {
    const errorMessage = error?.message || 'An unexpected error occurred';
    
    if (errorMessage.includes('AI services are not configured')) {
      toast({
        title: 'Configuration Required',
        description: 'Please configure either Claude (Anthropic) or Gemini (Google) API keys to use AI features.',
        variant: 'destructive',
      });
    } else if (errorMessage.includes('credit balance')) {
      toast({
        title: 'Insufficient Credits',
        description: 'Claude API credits are depleted. The system will attempt to use Gemini as a fallback.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }

    addUpdate({
      agent: 'System',
      message: errorMessage,
      type: 'analysis',
      status: 'error'
    });
  };

  const generateTaskDescription = async () => {
    if (!userCode.trim()) {
      toast({
        title: 'Code Required',
        description: 'Please provide some code before generating a task',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'ai-coordinator',
          messages: [{
            role: 'user',
            content: `Analyze this code and suggest a meaningful task or improvement that would benefit from AI collaboration:\n\n${userCode}`
          }]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate task');
      }

      const data = await response.json();
      setTask(data.content);
      
      toast({
        title: 'Task Generated',
        description: 'AI has suggested a task based on your code',
      });
    } catch (error: any) {
      handleAPIError(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startFullDemo = async () => {
    if (!userCode.trim() || !task.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please provide both code and task description',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setUpdates([]);

    try {
      // Simulate comprehensive demo
      const demoSteps = [
        { name: 'Code Analysis', progress: 20, delay: 2000 },
        { name: 'Template Matching', progress: 40, delay: 1500 },
        { name: 'AI Improvements', progress: 60, delay: 2000 },
        { name: 'Deployment Setup', progress: 80, delay: 1500 },
        { name: 'Collaboration Ready', progress: 100, delay: 1000 }
      ];

      for (const step of demoSteps) {
        addUpdate({
          agent: 'Demo Coordinator',
          message: `${step.name} in progress...`,
          type: 'analysis',
          status: 'pending'
        });

        await new Promise(resolve => setTimeout(resolve, step.delay));
        setProgress(step.progress);

        addUpdate({
          agent: 'Demo Coordinator',
          message: `${step.name} completed successfully!`,
          type: 'analysis',
          status: 'success'
        });
      }

      toast({
        title: 'Demo Complete',
        description: 'Experience the full power of CodeCollab AI!',
      });

    } catch (error: any) {
      handleAPIError(error);
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const runFeatureDemo = async (feature: DemoFeature) => {
    await feature.demo();
    toast({
      title: `${feature.name} Demo`,
      description: feature.description,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CodeIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-bold text-2xl">CodeCollab AI</h1>
              <p className="text-sm text-muted-foreground">Interactive Demo Experience</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={startFullDemo}
              disabled={isGenerating || !userCode.trim() || !task.trim()}
              className="gap-2"
              size="lg"
            >
              <SparklesIcon className="h-5 w-5" />
              {isGenerating ? 'Running Demo...' : 'Start Full Demo'}
            </Button>
            <Button variant="outline" asChild>
              <a href="/auth/signup">Get Started Free</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Interactive Demo Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CodeIcon className="h-5 w-5" />
                  Interactive Code Demo
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateTaskDescription}
                  disabled={isGenerating || !userCode.trim()}
                >
                  <Wand2Icon className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Task'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Code:</label>
                  <div className="min-h-[300px] border rounded-md overflow-hidden">
                    <Editor
                      height="300px"
                      defaultLanguage="typescript"
                      value={userCode}
                      onChange={(value) => setUserCode(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Task Description:</label>
                  <Textarea
                    placeholder="Describe what you want the AI agents to help you with, or click 'Generate Task' to let AI suggest improvements..."
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Demo Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feature Showcase */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5" />
                Advanced Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {demoFeatures.map((feature) => (
                  <motion.div
                    key={feature.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all border-2 ${
                        activeFeature === feature.id 
                          ? 'border-primary shadow-lg' 
                          : 'border-transparent hover:border-muted-foreground/20'
                      }`}
                      onClick={() => runFeatureDemo(feature)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${feature.color} text-white`}>
                            {feature.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{feature.name}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                          <PlayIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Code Metrics Display */}
              {activeFeature === 'intelligence' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-muted/50 rounded-lg"
                >
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUpIcon className="h-4 w-4" />
                    Code Quality Metrics
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(codeMetrics).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{key}</span>
                          <span className="font-medium">{value}/100</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Activity Feed */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuitIcon className="h-5 w-5" />
              Live Agent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {updates.map((update, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 text-sm"
                >
                  {update.status === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : update.status === 'error' ? (
                    <AlertCircleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{update.agent}</span>
                      <Badge variant="outline" className="text-xs">
                        {update.type}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{update.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {update.timestamp.toLocaleTimeString()}
                  </span>
                </motion.div>
              ))}

              {updates.length === 0 && !isGenerating && (
                <div className="text-center text-muted-foreground py-8">
                  <BrainCircuitIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click on features above or start the full demo to see AI agents in action</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build with AI?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the future of collaborative coding with intelligent AI agents, 
            real-time collaboration, and production-ready templates.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <a href="/auth/signup">Start Building Free</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/dashboard">View Dashboard</a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}