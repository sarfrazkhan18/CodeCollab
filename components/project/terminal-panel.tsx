'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TerminalIcon,
  PlusIcon,
  XIcon,
  SettingsIcon,
  CopyIcon,
  TrashIcon
} from 'lucide-react';
import { terminalService, TerminalSession, TerminalOutput } from '@/lib/terminal/terminal';
import { useToast } from '@/hooks/use-toast';

interface TerminalPanelProps {
  projectId: string;
}

export function TerminalPanel({ projectId }: TerminalPanelProps) {
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create initial terminal session
    const initialSession = terminalService.createSession('Terminal 1', '/project');
    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new output is added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessions]);

  useEffect(() => {
    // Focus input when active session changes
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeSessionId]);

  const createNewSession = () => {
    const sessionCount = sessions.length + 1;
    const newSession = terminalService.createSession(`Terminal ${sessionCount}`, '/project');
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
  };

  const closeSession = (sessionId: string) => {
    if (sessions.length === 1) {
      toast({
        title: 'Cannot close',
        description: 'At least one terminal session must remain open',
        variant: 'destructive',
      });
      return;
    }

    terminalService.closeSession(sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    if (activeSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      setActiveSessionId(remainingSessions[0]?.id || null);
    }
  };

  const executeCommand = async () => {
    if (!command.trim() || !activeSessionId) return;

    try {
      setIsExecuting(true);
      const outputs = await terminalService.executeCommand(activeSessionId, command);
      
      // Update sessions with new output
      setSessions(prev => prev.map(session => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            history: [...session.history, ...outputs]
          };
        }
        return session;
      }));
      
      setCommand('');
    } catch (error) {
      toast({
        title: 'Command failed',
        description: 'Failed to execute command',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      // TODO: Implement command history navigation
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      // TODO: Implement command history navigation
      e.preventDefault();
    }
  };

  const clearTerminal = () => {
    if (activeSessionId) {
      terminalService.clearHistory(activeSessionId);
      setSessions(prev => prev.map(session => {
        if (session.id === activeSessionId) {
          return { ...session, history: [] };
        }
        return session;
      }));
    }
  };

  const copyOutput = (output: TerminalOutput) => {
    navigator.clipboard.writeText(output.content);
    toast({
      title: 'Copied',
      description: 'Output copied to clipboard',
    });
  };

  const getActiveSession = () => {
    return sessions.find(s => s.id === activeSessionId);
  };

  const getOutputTypeColor = (type: TerminalOutput['type']) => {
    switch (type) {
      case 'command':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      case 'output':
        return 'text-green-400';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono">
      <div className="border-b border-gray-700 p-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2 text-white">
            <TerminalIcon className="h-4 w-4" />
            Terminal
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTerminal}
              className="text-gray-400 hover:text-white"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={createNewSession}
              className="text-gray-400 hover:text-white"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Session Tabs */}
        {sessions.length > 1 && (
          <Tabs value={activeSessionId || ''} onValueChange={setActiveSessionId}>
            <TabsList className="bg-gray-800 border-gray-600">
              {sessions.map((session) => (
                <TabsTrigger
                  key={session.id}
                  value={session.id}
                  className="relative data-[state=active]:bg-gray-700"
                >
                  {session.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-4 w-4 p-0 text-gray-400 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeSession(session.id);
                    }}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {/* Terminal Output */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-1">
            {getActiveSession()?.history.map((output) => (
              <div
                key={output.id}
                className={`group relative ${getOutputTypeColor(output.type)}`}
              >
                <div className="flex items-start justify-between">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed flex-1">
                    {output.content}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 ml-2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                    onClick={() => copyOutput(output)}
                  >
                    <CopyIcon className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {getActiveSession()?.history.length === 0 && (
              <div className="text-gray-500 text-sm">
                Welcome to CodeCollab AI Terminal. Type a command to get started.
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Command Input */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">$</span>
            <Input
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              disabled={isExecuting}
              className="bg-transparent border-none text-green-400 placeholder-gray-500 focus:ring-0 focus:border-none font-mono"
            />
            {isExecuting && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}