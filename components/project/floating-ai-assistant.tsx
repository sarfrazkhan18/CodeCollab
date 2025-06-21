'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  BrainCircuitIcon, 
  XIcon, 
  SendIcon, 
  SparklesIcon,
  ZapIcon,
  CodeIcon,
  BugIcon,
  WandIcon,
  TrendingUpIcon,
  ShieldIcon,
  MessageSquareIcon
} from 'lucide-react';

interface FloatingAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentFile: string | null;
  currentCode: string;
  onCodeGenerated: (code: string, filePath: string) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'generate' | 'improve' | 'analyze';
}

export function FloatingAIAssistant({ 
  isOpen, 
  onClose, 
  currentFile, 
  currentCode, 
  onCodeGenerated 
}: FloatingAIAssistantProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'actions' | 'insights'>('actions');

  const quickActions: QuickAction[] = [
    {
      id: 'generate-component',
      title: 'Generate Component',
      description: 'Create a new React component',
      icon: <CodeIcon className="h-4 w-4" />,
      action: () => generateCode('Generate a new React component'),
      category: 'generate'
    },
    {
      id: 'optimize-code',
      title: 'Optimize Performance',
      description: 'Improve code performance',
      icon: <ZapIcon className="h-4 w-4" />,
      action: () => generateCode('Optimize this code for better performance'),
      category: 'improve'
    },
    {
      id: 'fix-bugs',
      title: 'Find & Fix Bugs',
      description: 'Detect and fix potential issues',
      icon: <BugIcon className="h-4 w-4" />,
      action: () => generateCode('Find and fix bugs in this code'),
      category: 'analyze'
    },
    {
      id: 'refactor-code',
      title: 'Refactor Code',
      description: 'Improve code structure',
      icon: <WandIcon className="h-4 w-4" />,
      action: () => generateCode('Refactor this code for better readability'),
      category: 'improve'
    },
    {
      id: 'add-tests',
      title: 'Generate Tests',
      description: 'Create test cases',
      icon: <ShieldIcon className="h-4 w-4" />,
      action: () => generateCode('Generate comprehensive tests for this code'),
      category: 'generate'
    },
    {
      id: 'analyze-complexity',
      title: 'Analyze Complexity',
      description: 'Review code complexity',
      icon: <TrendingUpIcon className="h-4 w-4" />,
      action: () => generateCode('Analyze the complexity of this code'),
      category: 'analyze'
    }
  ];

  const generateCode = async (prompt: string) => {
    setIsThinking(true);
    setActiveTab('chat');
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I've analyzed your request: "${prompt}". Here's what I can help you with:`,
        timestamp: new Date(),
        suggestions: [
          'Generate the requested code',
          'Add proper error handling',
          'Include TypeScript types',
          'Add documentation'
        ]
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    await generateCode(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getCategoryActions = (category: string) => {
    return quickActions.filter(action => action.category === category);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed top-16 right-4 z-50 w-96 max-h-[80vh] flex flex-col"
        >
          <Card className="shadow-2xl border border-border/50 bg-background/95 backdrop-blur flex flex-col h-full">
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BrainCircuitIcon className="h-5 w-5 text-primary" />
                  AI Assistant
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-6 w-6"
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex gap-1 mt-2">
                <Button
                  variant={activeTab === 'actions' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('actions')}
                  className="text-xs"
                >
                  Quick Actions
                </Button>
                <Button
                  variant={activeTab === 'chat' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('chat')}
                  className="text-xs"
                >
                  <MessageSquareIcon className="h-3 w-3 mr-1" />
                  Chat
                </Button>
                <Button
                  variant={activeTab === 'insights' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('insights')}
                  className="text-xs"
                >
                  Insights
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden">
              {activeTab === 'actions' && (
                <div className="p-4 space-y-4 overflow-y-auto max-h-96">
                  {currentFile ? (
                    <>
                      <div className="text-xs text-muted-foreground mb-3">
                        Working on: <span className="font-mono">{currentFile}</span>
                      </div>
                      
                      {/* Generate Actions */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <SparklesIcon className="h-3 w-3 text-green-500" />
                          Generate
                        </h4>
                        <div className="space-y-2">
                          {getCategoryActions('generate').map((action) => (
                            <motion.div
                              key={action.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="p-2 rounded border border-border/50 hover:border-border cursor-pointer"
                              onClick={action.action}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-green-500">{action.icon}</div>
                                <span className="font-medium text-sm">{action.title}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{action.description}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Improve Actions */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <ZapIcon className="h-3 w-3 text-blue-500" />
                          Improve
                        </h4>
                        <div className="space-y-2">
                          {getCategoryActions('improve').map((action) => (
                            <motion.div
                              key={action.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="p-2 rounded border border-border/50 hover:border-border cursor-pointer"
                              onClick={action.action}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-blue-500">{action.icon}</div>
                                <span className="font-medium text-sm">{action.title}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{action.description}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Analyze Actions */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <TrendingUpIcon className="h-3 w-3 text-purple-500" />
                          Analyze
                        </h4>
                        <div className="space-y-2">
                          {getCategoryActions('analyze').map((action) => (
                            <motion.div
                              key={action.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="p-2 rounded border border-border/50 hover:border-border cursor-pointer"
                              onClick={action.action}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-purple-500">{action.icon}</div>
                                <span className="font-medium text-sm">{action.title}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{action.description}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <CodeIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">Select a file to see AI suggestions</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-80">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquareIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">Start a conversation with AI</p>
                      </div>
                    ) : (
                      chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-2 ${
                              message.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            {message.suggestions && (
                              <div className="mt-2 space-y-1">
                                {message.suggestions.map((suggestion, index) => (
                                  <div key={index} className="text-xs opacity-75">
                                    • {suggestion}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    
                    {isThinking && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-2">
                          <div className="loading-dots">
                            <div style={{'--i': 0} as React.CSSProperties}></div>
                            <div style={{'--i': 1} as React.CSSProperties}></div>
                            <div style={{'--i': 2} as React.CSSProperties}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t p-3">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Ask AI anything about your code..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="min-h-[60px] text-sm"
                        disabled={isThinking}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isThinking}
                        size="icon"
                        className="shrink-0"
                      >
                        <SendIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="p-4 space-y-3 overflow-y-auto max-h-96">
                  {currentFile ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUpIcon className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-sm">Code Quality</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Your code follows good practices with room for optimization
                        </p>
                      </div>
                      
                      <div className="p-3 bg-green-500/10 rounded border border-green-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldIcon className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-sm">Security</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          No security vulnerabilities detected
                        </p>
                      </div>
                      
                      <div className="p-3 bg-yellow-500/10 rounded border border-yellow-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <ZapIcon className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium text-sm">Performance</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Consider adding React.memo for better performance
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUpIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">Select a file to see insights</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}