'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrainCircuitIcon, MessageSquareIcon, CodeIcon, UsersIcon } from 'lucide-react';

interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'thinking' | 'coding' | 'collaborating' | 'reviewing';
  currentTask: string;
  progress: number;
  collaboratingWith?: string[];
  lastMessage?: string;
  color: string;
}

export function AgentActivityDashboard() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);

  useEffect(() => {
    // In production, this would use WebSocket for real-time updates
    const mockAgents: AgentStatus[] = [
      {
        id: 'frontend-specialist',
        name: 'Frontend Specialist',
        status: 'coding',
        currentTask: 'Implementing responsive UI components',
        progress: 65,
        collaboratingWith: ['backend-specialist'],
        lastMessage: 'Adding real-time update handlers',
        color: 'var(--chart-1)',
      },
      {
        id: 'backend-specialist',
        name: 'Backend Specialist',
        status: 'thinking',
        currentTask: 'Designing WebSocket architecture',
        progress: 40,
        collaboratingWith: ['frontend-specialist'],
        lastMessage: 'Evaluating scaling options',
        color: 'var(--chart-2)',
      },
      {
        id: 'database-specialist',
        name: 'Database Specialist',
        status: 'collaborating',
        currentTask: 'Optimizing real-time queries',
        progress: 30,
        collaboratingWith: ['backend-specialist'],
        lastMessage: 'Suggesting indexing strategy',
        color: 'var(--chart-3)',
      },
      {
        id: 'testing-specialist',
        name: 'Testing Specialist',
        status: 'reviewing',
        currentTask: 'Writing integration tests',
        progress: 85,
        lastMessage: 'Validating WebSocket connections',
        color: 'var(--chart-4)',
      },
    ];

    setAgents(mockAgents);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setAgents(current =>
        current.map(agent => ({
          ...agent,
          progress: Math.min(100, agent.progress + Math.random() * 5),
          status:
            Math.random() > 0.8
              ? (['idle', 'thinking', 'coding', 'collaborating', 'reviewing'][
                  Math.floor(Math.random() * 5)
                ] as AgentStatus['status'])
              : agent.status,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'thinking':
        return <BrainCircuitIcon className="h-4 w-4" />;
      case 'coding':
        return <CodeIcon className="h-4 w-4" />;
      case 'collaborating':
        return <UsersIcon className="h-4 w-4" />;
      case 'reviewing':
        return <MessageSquareIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'thinking':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'coding':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'collaborating':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'reviewing':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border rounded-lg">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BrainCircuitIcon className="h-5 w-5 text-primary" />
          Agent Activity Monitor
        </h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {agents.map(agent => (
            <div key={agent.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.name[0]}
                  </div>
                  <div>
                    <h3 className="font-medium">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.currentTask}</p>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(agent.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(agent.status)}
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </span>
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(agent.progress)}%</span>
                </div>
                <Progress
                  value={agent.progress}
                  className="h-2"
                  style={{
                    '--progress-background': agent.color,
                  } as React.CSSProperties}
                />
              </div>

              {agent.collaboratingWith && agent.collaboratingWith.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <UsersIcon className="h-4 w-4" />
                  <span>Collaborating with: {agent.collaboratingWith.join(', ')}</span>
                </div>
              )}

              {agent.lastMessage && (
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Last message: </span>
                  {agent.lastMessage}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}