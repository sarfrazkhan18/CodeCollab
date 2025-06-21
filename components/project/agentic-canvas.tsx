'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CodeIcon, 
  PanelLeftIcon, 
  PanelRightIcon, 
  PlayIcon, 
  SaveIcon, 
  SparklesIcon, 
  MonitorIcon, 
  BrainCircuitIcon, 
  UsersIcon, 
  RocketIcon, 
  BookTemplateIcon as TemplateIcon,
  FolderIcon,
  SearchIcon,
  CommandIcon,
  ZapIcon,
  WandIcon,
  GitBranchIcon,
  TerminalIcon,
  MessageSquareIcon,
  BugIcon,
  TrendingUpIcon,
  ShieldIcon,
  PlusIcon,
  ArrowRightIcon,
  EyeIcon,
  MoveIcon,
  LayoutIcon,
  ActivityIcon,
  XIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/hooks/use-toast';

// Import workspace components
import { CodeEditor } from '@/components/project/code-editor';
import { FileExplorer } from '@/components/project/file-explorer';
import { AgentPanel } from '@/components/project/agent-panel';
import { LivePreview } from '@/components/project/live-preview';
import { EnhancedCodeGeneration } from '@/components/project/enhanced-code-generation';
import { CodeIntelligencePanel } from '@/components/intelligence/code-intelligence-panel';

interface AgenticCanvasProps {
  projectId: string;
  project: any;
  projectFiles: Record<string, string>;
  currentFile: string | null;
  currentCode: string;
  onFileSelect: (filePath: string) => void;
  onCodeChange: (code: string) => void;
  onCodeGenerated: (code: string, filePath: string) => void;
}

interface AIContextSuggestion {
  id: string;
  type: 'action' | 'suggestion' | 'warning' | 'optimization';
  title: string;
  description: string;
  action: () => void;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
}

interface AgentActivity {
  id: string;
  agent: string;
  action: string;
  status: 'active' | 'completed' | 'thinking';
  progress?: number;
}

export function AgenticCanvas({ 
  projectId, 
  project, 
  projectFiles, 
  currentFile, 
  currentCode, 
  onFileSelect, 
  onCodeChange, 
  onCodeGenerated 
}: AgenticCanvasProps) {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [leftPanelTab, setLeftPanelTab] = useState('files');
  const [rightPanelTab, setRightPanelTab] = useState('preview');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [contextSuggestions, setContextSuggestions] = useState<AIContextSuggestion[]>([]);
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [smartLayout, setSmartLayout] = useState<'code' | 'design' | 'debug' | 'collaborate'>('code');
  const commandPaletteRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette (Cmd/Ctrl + K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      
      // AI Assistant (Cmd/Ctrl + Shift + A)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAIAssistant(!showAIAssistant);
      }

      // Quick actions
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        handleRun();
      }

      // Escape to close overlays
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowAIAssistant(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAIAssistant]);

  // Focus command palette when opened
  useEffect(() => {
    if (showCommandPalette && commandPaletteRef.current) {
      commandPaletteRef.current.focus();
    }
  }, [showCommandPalette]);

  // Generate contextual AI suggestions based on current state
  useEffect(() => {
    generateContextualSuggestions();
  }, [currentFile, currentCode, leftPanelTab, rightPanelTab]);

  // Simulate agent activities
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentActivities(prev => [
        ...prev.slice(-2), // Keep only last 2 activities
        {
          id: Date.now().toString(),
          agent: ['Code Assistant', 'Designer', 'Optimizer', 'Tester'][Math.floor(Math.random() * 4)],
          action: ['Analyzing code...', 'Optimizing performance...', 'Checking for bugs...', 'Generating suggestions...'][Math.floor(Math.random() * 4)],
          status: Math.random() > 0.7 ? 'completed' : 'thinking',
          progress: Math.floor(Math.random() * 100)
        }
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const generateContextualSuggestions = useCallback(() => {
    const suggestions: AIContextSuggestion[] = [];

    if (currentFile && currentCode) {
      // Code-specific suggestions
      if (currentCode.includes('TODO') || currentCode.includes('FIXME')) {
        suggestions.push({
          id: 'fix-todos',
          type: 'action',
          title: 'Fix TODOs',
          description: 'Let AI help complete your TODO items',
          action: () => generateCode('Fix TODO items in this file'),
          icon: <BugIcon className="h-4 w-4" />,
          priority: 'medium'
        });
      }

      if (currentCode.length > 1000) {
        suggestions.push({
          id: 'refactor-large',
          type: 'optimization',
          title: 'Refactor Large File',
          description: 'Break down this large file into smaller components',
          action: () => generateCode('Refactor this large file into smaller, more manageable components'),
          icon: <ZapIcon className="h-4 w-4" />,
          priority: 'high'
        });
      }

      if (!currentCode.includes('test') && !currentCode.includes('spec')) {
        suggestions.push({
          id: 'add-tests',
          type: 'suggestion',
          title: 'Add Tests',
          description: 'Generate test cases for this component',
          action: () => generateCode('Generate comprehensive tests for this component'),
          icon: <ShieldIcon className="h-4 w-4" />,
          priority: 'medium'
        });
      }
    }

    // Panel-specific suggestions
    if (leftPanelTab === 'files' && Object.keys(projectFiles).length < 5) {
      suggestions.push({
        id: 'generate-structure',
        type: 'action',
        title: 'Generate Project Structure',
        description: 'Create a complete project structure with AI',
        action: () => setLeftPanelTab('ai'),
        icon: <TemplateIcon className="h-4 w-4" />,
        priority: 'high'
      });
    }

    if (rightPanelTab === 'preview' && !currentCode.includes('export default')) {
      suggestions.push({
        id: 'create-component',
        type: 'action',
        title: 'Create Component',
        description: 'Generate a React component to preview',
        action: () => generateCode('Create a basic React component'),
        icon: <CodeIcon className="h-4 w-4" />,
        priority: 'high'
      });
    }

    setContextSuggestions(suggestions.slice(0, 3)); // Show top 3 suggestions
  }, [currentFile, currentCode, leftPanelTab, rightPanelTab, projectFiles]);

  const generateCode = async (prompt: string) => {
    setIsAIThinking(true);
    try {
      // Simulate AI code generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'AI is working',
        description: 'Code generation in progress...',
      });
      setLeftPanelTab('ai');
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleSave = () => {
    toast({
      title: 'Project saved',
      description: 'All changes have been saved successfully',
    });
  };

  const handleRun = () => {
    setRightPanelTab('preview');
    toast({
      title: 'Starting preview',
      description: 'Development server is starting...',
    });
  };

  const switchToSmartLayout = (layout: typeof smartLayout) => {
    setSmartLayout(layout);
    
    // Automatically adjust panels based on layout
    switch (layout) {
      case 'code':
        setLeftPanelTab('files');
        setRightPanelTab('intelligence');
        break;
      case 'design':
        setLeftPanelTab('ai');
        setRightPanelTab('preview');
        break;
      case 'debug':
        setLeftPanelTab('terminal');
        setRightPanelTab('intelligence');
        break;
      case 'collaborate':
        setLeftPanelTab('files');
        setRightPanelTab('collab');
        break;
    }
  };

  const commands = [
    { id: 'generate-component', title: 'Generate Component', action: () => generateCode('Generate a new React component'), icon: <CodeIcon className="h-4 w-4" /> },
    { id: 'create-test', title: 'Create Tests', action: () => generateCode('Create test files'), icon: <BugIcon className="h-4 w-4" /> },
    { id: 'optimize-code', title: 'Optimize Code', action: () => generateCode('Optimize current code for performance'), icon: <ZapIcon className="h-4 w-4" /> },
    { id: 'add-documentation', title: 'Add Documentation', action: () => generateCode('Add documentation to the code'), icon: <TemplateIcon className="h-4 w-4" /> },
    { id: 'switch-to-files', title: 'Go to Files', action: () => setLeftPanelTab('files'), icon: <FolderIcon className="h-4 w-4" /> },
    { id: 'switch-to-preview', title: 'Show Preview', action: () => setRightPanelTab('preview'), icon: <MonitorIcon className="h-4 w-4" /> },
    { id: 'toggle-ai-assistant', title: 'Toggle AI Assistant', action: () => setShowAIAssistant(!showAIAssistant), icon: <BrainCircuitIcon className="h-4 w-4" /> },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(commandQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen flex-col bg-background relative overflow-hidden">
      {/* Enhanced Header */}
      <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 lg:px-6 relative z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <CodeIcon className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold">{project.name}</h1>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <div className="status-dot status-online mr-1"></div>
              Live
            </Badge>
          </div>
        </div>

        {/* Smart Layout Switcher */}
        <div className="hidden md:flex items-center gap-1 ml-8">
          {[
            { key: 'code', icon: <CodeIcon className="h-3 w-3" />, label: 'Code' },
            { key: 'design', icon: <PaletteIcon className="h-3 w-3" />, label: 'Design' },
            { key: 'debug', icon: <BugIcon className="h-3 w-3" />, label: 'Debug' },
            { key: 'collaborate', icon: <UsersIcon className="h-3 w-3" />, label: 'Collab' },
          ].map((layout) => (
            <Button
              key={layout.key}
              variant={smartLayout === layout.key ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => switchToSmartLayout(layout.key as any)}
              className="text-xs"
            >
              {layout.icon}
              <span className="ml-1 hidden lg:inline">{layout.label}</span>
            </Button>
          ))}
        </div>
        
        {/* Agent Activity Indicator */}
        <div className="flex items-center gap-2 ml-auto">
          <AnimatePresence>
            {agentActivities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <div className="flex items-center gap-1">
                  <ActivityIcon className="h-3 w-3 animate-pulse text-primary" />
                  <span>AI Active</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Actions */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommandPalette(true)}
            className="text-muted-foreground"
          >
            <CommandIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">⌘K</span>
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleSave}>
            <SaveIcon className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button size="sm" onClick={handleRun}>
            <PlayIcon className="mr-2 h-4 w-4" />
            Run
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Canvas */}
      <div className="flex-1 overflow-hidden relative">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel */}
          {showLeftPanel && (
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="h-full border-r bg-background"
              >
                <Tabs value={leftPanelTab} onValueChange={setLeftPanelTab} className="h-full flex flex-col">
                  <div className="border-b p-2">
                    <TabsList className="grid w-full grid-cols-4 h-8">
                      <TabsTrigger value="files" className="text-xs px-1">
                        <FolderIcon className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="git" className="text-xs px-1">
                        <GitBranchIcon className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="ai" className="text-xs px-1 relative">
                        <SparklesIcon className="h-3 w-3" />
                        {isAIThinking && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="terminal" className="text-xs px-1">
                        <TerminalIcon className="h-3 w-3" />
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="files" className="flex-1 p-0 m-0">
                    <FileExplorer 
                      onSelectFile={onFileSelect} 
                      files={projectFiles}
                      currentFile={currentFile}
                    />
                  </TabsContent>
                  
                  <TabsContent value="ai" className="flex-1 p-0 m-0">
                    <EnhancedCodeGeneration 
                      projectId={projectId} 
                      onCodeGenerated={onCodeGenerated}
                    />
                  </TabsContent>
                  
                  <TabsContent value="git" className="flex-1 p-0 m-0">
                    <div className="p-4 text-sm text-muted-foreground">
                      Git integration coming soon
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="terminal" className="flex-1 p-0 m-0">
                    <div className="p-4 text-sm text-muted-foreground">
                      Terminal integration coming soon
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </ResizablePanel>
          )}

          <ResizableHandle withHandle />

          {/* Center Panel (Code Editor) */}
          <ResizablePanel defaultSize={showRightPanel ? 45 : 75}>
            <div className="h-full relative bg-background">
              {/* Floating Panel Controls */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowLeftPanel(!showLeftPanel)}
                    className="h-7 w-7 rounded-full bg-background/80 backdrop-blur shadow-sm border border-border/50"
                  >
                    <PanelLeftIcon className="h-3 w-3" />
                  </Button>
                </motion.div>
              </div>
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowRightPanel(!showRightPanel)}
                    className="h-7 w-7 rounded-full bg-background/80 backdrop-blur shadow-sm border border-border/50"
                  >
                    <PanelRightIcon className="h-3 w-3" />
                  </Button>
                </motion.div>
              </div>

              {/* AI Assistant Toggle */}
              <div className="absolute right-2 top-4 z-10">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant={showAIAssistant ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                    className="h-8 w-8 rounded-full bg-background/80 backdrop-blur shadow-sm border border-border/50"
                  >
                    <BrainCircuitIcon className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
              
              {currentFile ? (
                <div className="h-full">
                  <CodeEditor 
                    filePath={currentFile} 
                    code={currentCode}
                    onChange={onCodeChange}
                  />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-muted/20">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-full bg-muted p-4"
                  >
                    <CodeIcon className="h-8 w-8 text-muted-foreground" />
                  </motion.div>
                  <h3 className="mb-3 text-xl font-semibold">Welcome to {project.name}</h3>
                  <p className="mb-8 text-muted-foreground max-w-md leading-relaxed">
                    Select a file from the explorer, generate code with AI, or use the command palette to start coding
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => setLeftPanelTab('files')} variant="outline">
                      <FolderIcon className="mr-2 h-4 w-4" />
                      Browse Files
                    </Button>
                    <Button onClick={() => setLeftPanelTab('ai')}>
                      <SparklesIcon className="mr-2 h-4 w-4" />
                      Generate Code
                    </Button>
                    <Button variant="ghost" onClick={() => setShowCommandPalette(true)}>
                      <CommandIcon className="mr-2 h-4 w-4" />
                      Command Palette
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>

          {showRightPanel && (
            <>
              <ResizableHandle withHandle />
              
              {/* Right Panel */}
              <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
                <motion.div
                  initial={{ x: 300 }}
                  animate={{ x: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="h-full border-l bg-background"
                >
                  <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="h-full flex flex-col">
                    <div className="border-b p-2">
                      <TabsList className="grid w-full grid-cols-4 h-8">
                        <TabsTrigger value="preview" className="text-xs px-1">
                          <MonitorIcon className="h-3 w-3" />
                        </TabsTrigger>
                        <TabsTrigger value="intelligence" className="text-xs px-1">
                          <BrainCircuitIcon className="h-3 w-3" />
                        </TabsTrigger>
                        <TabsTrigger value="agents" className="text-xs px-1">
                          <SparklesIcon className="h-3 w-3" />
                        </TabsTrigger>
                        <TabsTrigger value="collab" className="text-xs px-1">
                          <UsersIcon className="h-3 w-3" />
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="preview" className="flex-1 p-0 m-0">
                      <LivePreview projectId={projectId} files={projectFiles} />
                    </TabsContent>
                    
                    <TabsContent value="intelligence" className="flex-1 p-0 m-0">
                      <CodeIntelligencePanel 
                        currentFile={currentFile}
                        code={currentCode}
                        language="typescript"
                      />
                    </TabsContent>
                    
                    <TabsContent value="agents" className="flex-1 p-0 m-0">
                      <AgentPanel projectId={projectId} />
                    </TabsContent>
                    
                    <TabsContent value="collab" className="flex-1 p-0 m-0">
                      <div className="p-4 text-sm text-muted-foreground">
                        Collaboration features coming soon
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        {/* Floating AI Assistant */}
        <AnimatePresence>
          {showAIAssistant && (
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, y: 20 }}
              className="absolute top-4 right-16 z-50 w-80"
            >
              <Card className="shadow-xl border border-border/50 bg-background/95 backdrop-blur">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <BrainCircuitIcon className="h-4 w-4 text-primary" />
                      AI Assistant
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAIAssistant(false)}
                      className="h-6 w-6"
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {contextSuggestions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground mb-3">Smart suggestions for your current context:</p>
                      {contextSuggestions.map((suggestion) => (
                        <motion.div
                          key={suggestion.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-2 rounded border border-border/50 hover:border-border cursor-pointer"
                          onClick={suggestion.action}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-primary">{suggestion.icon}</div>
                            <span className="font-medium text-sm">{suggestion.title}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                suggestion.priority === 'high' ? 'border-red-500/20 text-red-500' :
                                suggestion.priority === 'medium' ? 'border-yellow-500/20 text-yellow-500' :
                                'border-blue-500/20 text-blue-500'
                              }`}
                            >
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <SparklesIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">No suggestions at the moment</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Command Palette */}
        <AnimatePresence>
          {showCommandPalette && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]"
              onClick={() => setShowCommandPalette(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="shadow-2xl border border-border/50">
                  <CardContent className="p-0">
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-2 mb-2">
                        <CommandIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Command Palette</span>
                      </div>
                      <Input
                        ref={commandPaletteRef}
                        placeholder="Type a command or search..."
                        value={commandQuery}
                        onChange={(e) => setCommandQuery(e.target.value)}
                        className="border-0 px-0 focus-visible:ring-0"
                      />
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {filteredCommands.map((command, index) => (
                        <motion.div
                          key={command.id}
                          whileHover={{ backgroundColor: 'hsl(var(--accent))' }}
                          className="flex items-center gap-3 p-3 cursor-pointer border-b border-border/50 last:border-0"
                          onClick={() => {
                            command.action();
                            setShowCommandPalette(false);
                          }}
                        >
                          <div className="text-muted-foreground">{command.icon}</div>
                          <span className="text-sm">{command.title}</span>
                          <ArrowRightIcon className="h-3 w-3 text-muted-foreground ml-auto" />
                        </motion.div>
                      ))}
                      
                      {filteredCommands.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                          No commands found
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper component for the design layout icon
function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V5z" />
    </svg>
  );
}