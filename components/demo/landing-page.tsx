'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuitIcon, CodeIcon, RocketIcon, CheckCircleIcon, AlertCircleIcon, PlayIcon, SaveIcon, Wand2Icon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Editor } from '@monaco-editor/react';

interface AgentUpdate {
  agent: string;
  message: string;
  timestamp: Date;
  type: 'suggestion' | 'improvement' | 'analysis';
  status: 'success' | 'error' | 'pending';
}

interface CodeExample {
  name: string;
  description: string;
  template: string;
}

const codeExamples: CodeExample[] = [
  {
    name: 'React Component',
    description: 'Create a responsive React component with TypeScript and Tailwind',
    template: `interface UserProfileProps {
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
}`
  },
  {
    name: 'API Endpoint',
    description: 'Design a RESTful API endpoint with error handling',
    template: `import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Add your API logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}`
  },
  {
    name: 'Database Schema',
    description: 'Create a database schema with relationships',
    template: `-- Define your schema here
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`
  }
];

export function DemoLandingPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [updates, setUpdates] = useState<AgentUpdate[]>([]);
  const [selectedExample, setSelectedExample] = useState<CodeExample>(codeExamples[0]);
  const [userCode, setUserCode] = useState(codeExamples[0].template);
  const [task, setTask] = useState('');
  const [isGeneratingTask, setIsGeneratingTask] = useState(false);
  const { toast } = useToast();

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
        variant: 'warning',
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

    setIsGeneratingTask(true);
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
      setIsGeneratingTask(false);
    }
  };

  const startCollaboration = async () => {
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
      // Code Review
      addUpdate({
        agent: 'Code Review Specialist',
        message: 'Analyzing code structure and patterns...',
        type: 'analysis',
        status: 'pending'
      });

      const reviewResponse = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'code-review',
          messages: [{
            role: 'user',
            content: `Review this code and suggest improvements:\n\n${userCode}\n\nTask: ${task}`
          }]
        })
      });

      if (!reviewResponse.ok) {
        const error = await reviewResponse.json();
        throw new Error(error.error || 'Code review failed');
      }
      
      const reviewData = await reviewResponse.json();
      
      addUpdate({
        agent: 'Code Review Specialist',
        message: reviewData.content,
        type: 'analysis',
        status: 'success'
      });
      setProgress(25);

      // Implementation Suggestions
      addUpdate({
        agent: 'Frontend Specialist',
        message: 'Generating implementation suggestions...',
        type: 'suggestion',
        status: 'pending'
      });

      const frontendResponse = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'frontend-specialist',
          messages: [{
            role: 'user',
            content: `Based on the review, improve this code:\n\n${userCode}\n\nTask: ${task}\n\nReview: ${reviewData.content}`
          }]
        })
      });

      if (!frontendResponse.ok) {
        const error = await frontendResponse.json();
        throw new Error(error.error || 'Implementation failed');
      }
      
      const frontendData = await frontendResponse.json();
      
      addUpdate({
        agent: 'Frontend Specialist',
        message: frontendData.content,
        type: 'suggestion',
        status: 'success'
      });
      setProgress(50);

      // Test Generation
      addUpdate({
        agent: 'Testing Specialist',
        message: 'Creating test cases...',
        type: 'improvement',
        status: 'pending'
      });

      const testingResponse = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'testing-specialist',
          messages: [{
            role: 'user',
            content: `Generate tests for this implementation:\n\n${frontendData.content}`
          }]
        })
      });

      if (!testingResponse.ok) {
        const error = await testingResponse.json();
        throw new Error(error.error || 'Test generation failed');
      }
      
      const testingData = await testingResponse.json();
      
      addUpdate({
        agent: 'Testing Specialist',
        message: testingData.content,
        type: 'improvement',
        status: 'success'
      });
      setProgress(75);

      // Final Integration
      const integrationResponse = await fetch('/api/ai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: `Integrate all improvements for: ${task}`
        })
      });

      if (!integrationResponse.ok) {
        const error = await integrationResponse.json();
        throw new Error(error.error || 'Integration failed');
      }
      
      addUpdate({
        agent: 'AI Coordinator',
        message: 'Successfully integrated all improvements',
        type: 'improvement',
        status: 'success'
      });
      setProgress(100);

      toast({
        title: 'Collaboration Complete',
        description: 'All agents have successfully contributed to the improvements',
      });

    } catch (error: any) {
      console.error('Collaboration error:', error);
      handleAPIError(error);
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CodeIcon className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">Interactive Demo</span>
          </div>
          <Button
            onClick={startCollaboration}
            disabled={isGenerating || !userCode.trim() || !task.trim()}
            className="gap-2"
          >
            <BrainCircuitIcon className="h-4 w-4" />
            {isGenerating ? 'Processing...' : 'Start Collaboration'}
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Code Editor Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CodeIcon className="h-5 w-5" />
                  Code Editor
                </CardTitle>
                <div className="flex gap-2">
                  <Tabs value={selectedExample.name} onValueChange={(value) => {
                    const example = codeExamples.find(ex => ex.name === value);
                    if (example) {
                      setSelectedExample(example);
                      setUserCode(example.template);
                    }
                  }}>
                    <TabsList>
                      {codeExamples.map((example) => (
                        <TabsTrigger
                          key={example.name}
                          value={example.name}
                        >
                          {example.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {selectedExample.description}
                </div>
                <div className="min-h-[400px] border rounded-md overflow-hidden">
                  <Editor
                    height="400px"
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Task Description:</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateTaskDescription}
                      disabled={isGeneratingTask || !userCode.trim()}
                    >
                      <Wand2Icon className="h-4 w-4 mr-2" />
                      {isGeneratingTask ? 'Generating...' : 'Generate Task'}
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Describe what you want the AI agents to help you with, or click 'Generate Task' to let AI suggest improvements..."
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    className="min-h-[100px]"
                  />
                  {!task && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Example tasks:
                      <ul className="list-disc list-inside mt-1">
                        <li>Add TypeScript types and improve type safety</li>
                        <li>Implement error handling and loading states</li>
                        <li>Optimize performance and reduce re-renders</li>
                        <li>Add accessibility features and ARIA labels</li>
                      </ul>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuitIcon className="h-5 w-5" />
                Agent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto">
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
                      <div>
                        <p className="font-medium">{update.agent}</p>
                        <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-md mt-2">
                          {update.message}
                        </pre>
                      </div>
                    </motion.div>
                  ))}

                  {updates.length === 0 && !isGenerating && (
                    <div className="text-center text-muted-foreground py-8">
                      <BrainCircuitIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a code example and describe your task to start the collaboration</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}