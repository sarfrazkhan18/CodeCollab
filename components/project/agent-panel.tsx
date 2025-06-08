'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BrainCircuitIcon,
  SendIcon,
  PlusIcon,
  ZapIcon,
  Bot,
  User,
} from 'lucide-react';
import { formatDistance } from 'date-fns';

interface AgentPanelProps {
  projectId: string;
}

interface AgentActivity {
  id: string;
  agent: string;
  title: string;
  status: 'in-progress' | 'completed' | 'failed' | 'idle';
  progress: number;
  timestamp: Date;
  color: string;
}

interface AgentMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
}

export function AgentPanel({ projectId }: AgentPanelProps) {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setIsLoading(true);

        // This would be a real Supabase query in production
        // For demo purposes, we're using mock data
        setTimeout(() => {
          const now = new Date();
          const mockActivities: AgentActivity[] = [
            {
              id: '1',
              agent: 'Frontend Specialist',
              title: 'Creating UI components',
              status: 'completed',
              progress: 100,
              timestamp: new Date(now.getTime() - 15 * 60000),
              color: 'var(--chart-1)',
            },
            {
              id: '2',
              agent: 'Backend Specialist',
              title: 'Setting up API routes',
              status: 'in-progress',
              progress: 65,
              timestamp: new Date(now.getTime() - 10 * 60000),
              color: 'var(--chart-2)',
            },
            {
              id: '3',
              agent: 'Database Specialist',
              title: 'Designing schema',
              status: 'in-progress',
              progress: 40,
              timestamp: new Date(now.getTime() - 5 * 60000),
              color: 'var(--chart-3)',
            },
            {
              id: '4',
              agent: 'Testing Specialist',
              title: 'Preparing test cases',
              status: 'idle',
              progress: 0,
              timestamp: new Date(now.getTime() - 2 * 60000),
              color: 'var(--chart-4)',
            },
          ];

          const mockMessages: AgentMessage[] = [
            {
              id: '1',
              sender: 'System',
              content: 'Project initialized. AI agents are ready to assist.',
              timestamp: new Date(now.getTime() - 30 * 60000),
              isUser: false,
            },
            {
              id: '2',
              sender: 'You',
              content: 'Create a basic Instagram clone with a feed and profile page',
              timestamp: new Date(now.getTime() - 28 * 60000),
              isUser: true,
            },
            {
              id: '3',
              sender: 'Frontend Specialist',
              content: 'I\'ll create the UI components for the feed and profile pages using React and Tailwind CSS.',
              timestamp: new Date(now.getTime() - 26 * 60000),
              isUser: false,
            },
            {
              id: '4',
              sender: 'Backend Specialist',
              content: 'I\'m setting up the API routes for authentication, post creation, and user profiles using FastAPI.',
              timestamp: new Date(now.getTime() - 22 * 60000),
              isUser: false,
            },
            {
              id: '5',
              sender: 'You',
              content: 'Can you add a like feature to the posts?',
              timestamp: new Date(now.getTime() - 18 * 60000),
              isUser: true,
            },
            {
              id: '6',
              sender: 'Database Specialist',
              content: 'I\'ve updated the database schema to include a likes table that will track user likes on posts.',
              timestamp: new Date(now.getTime() - 15 * 60000),
              isUser: false,
            },
            {
              id: '7',
              sender: 'Frontend Specialist',
              content: 'I\'ve implemented the like button UI with animations. The components are now in src/components/Post.tsx.',
              timestamp: new Date(now.getTime() - 10 * 60000),
              isUser: false,
            },
          ];

          setActivities(mockActivities);
          setMessages(mockMessages);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading agent data:', error);
        setIsLoading(false);
      }
    };

    fetchAgentData();
    
    // Simulate agent progress updates
    const progressInterval = setInterval(() => {
      setActivities(prev => 
        prev.map(activity => {
          if (activity.status === 'in-progress' && activity.progress < 100) {
            const newProgress = Math.min(activity.progress + 5, 100);
            const newStatus = newProgress === 100 ? 'completed' : 'in-progress';
            return { ...activity, progress: newProgress, status: newStatus };
          }
          return activity;
        })
      );
    }, 5000);

    return () => clearInterval(progressInterval);
  }, [projectId]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const newMessage: AgentMessage = {
      id: `user-${Date.now()}`,
      sender: 'You',
      content: input,
      timestamp: new Date(),
      isUser: true,
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    // Simulate agent response
    setTimeout(() => {
      const agents = ['Frontend Specialist', 'Backend Specialist', 'Database Specialist'];
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      
      const responses = [
        "I'll implement that feature right away.",
        "I've analyzed the request and started working on it.",
        "I'm updating the codebase to accommodate this change.",
        "Working on this now. I'll update you when it's ready."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const agentMessage: AgentMessage = {
        id: `agent-${Date.now()}`,
        sender: randomAgent,
        content: randomResponse,
        timestamp: new Date(),
        isUser: false,
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <Tabs defaultValue="chat" className="flex flex-col h-full">
        <div className="border-b">
          <div className="flex items-center px-4 py-2">
            <h3 className="font-medium flex items-center">
              <BrainCircuitIcon className="h-4 w-4 mr-2 text-primary" />
              AI Collaboration
            </h3>
            <TabsList className="ml-auto">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="chat" className="flex-1 p-0 data-[state=active]:flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {!message.isUser && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-4 w-4 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                          style={{ 
                            backgroundColor: 
                              message.sender === 'Frontend Specialist' 
                                ? 'var(--chart-1)' 
                                : message.sender === 'Backend Specialist'
                                ? 'var(--chart-2)'
                                : message.sender === 'Database Specialist'
                                ? 'var(--chart-3)'
                                : 'var(--primary)'
                          }}
                        >
                          {message.sender === 'System' ? 'S' : message.sender[0]}
                        </div>
                        <span className="text-xs font-medium">{message.sender}</span>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <div className="mt-1 text-right">
                      <span className="text-xs opacity-70">
                        {formatDistance(message.timestamp, new Date(), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t mt-auto">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Ask agents for help..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <Button size="icon" onClick={handleSendMessage} disabled={!input.trim()}>
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="activities" className="flex-1 p-0 data-[state=active]:flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h4 className="font-medium">Current Activities</h4>
            <Button variant="outline" size="sm">
              <PlusIcon className="h-3.5 w-3.5 mr-1" /> New Task
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2 border rounded-lg p-4">
                    <div className="h-4 w-1/3 bg-muted-foreground/20 rounded"></div>
                    <div className="h-4 w-2/3 bg-muted-foreground/20 rounded"></div>
                    <div className="h-4 w-full bg-muted-foreground/10 rounded"></div>
                  </div>
                ))
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div 
                          className="h-5 w-5 rounded-full mr-2 flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: activity.color }}
                        >
                          {activity.agent[0]}
                        </div>
                        <span className="font-medium">{activity.agent}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          activity.status === 'completed' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : activity.status === 'in-progress'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            : activity.status === 'failed'
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {activity.status === 'in-progress' ? 'In Progress' : 
                          activity.status === 'completed' ? 'Completed' :
                          activity.status === 'failed' ? 'Failed' : 'Idle'}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{activity.title}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{activity.progress}%</span>
                      </div>
                      <Progress 
                        value={activity.progress} 
                        className="h-2"
                        style={{ 
                          '--progress-background': activity.color
                        } as React.CSSProperties}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatDistance(activity.timestamp, new Date(), { addSuffix: true })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <Button className="w-full">
              <ZapIcon className="mr-2 h-4 w-4" />
              Generate Complete Project
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}