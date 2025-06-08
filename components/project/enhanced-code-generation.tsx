'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  WandIcon,
  CodeIcon,
  FileIcon,
  TestTubeIcon,
  FileTextIcon,
  SparklesIcon,
  CopyIcon,
  CheckIcon
} from 'lucide-react';
import { agentService } from '@/lib/ai/agents';
import { useToast } from '@/hooks/use-toast';

interface CodeGenerationResult {
  type: 'component' | 'function' | 'test' | 'documentation';
  title: string;
  code: string;
  language: string;
  explanation: string;
  suggestions: string[];
}

interface EnhancedCodeGenerationProps {
  projectId: string;
  onCodeGenerated: (code: string, filePath: string) => void;
}

export function EnhancedCodeGeneration({ projectId, onCodeGenerated }: EnhancedCodeGenerationProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<CodeGenerationResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const generateCode = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt required',
        description: 'Please enter a description of what you want to generate',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);
      setResults([]);

      // Generate component code
      const componentResponse = await agentService.sendMessage('frontend-specialist', [{
        role: 'user',
        content: `Generate a React component based on this description: ${prompt}. Include TypeScript types and proper styling with Tailwind CSS.`
      }]);

      // Generate tests
      const testResponse = await agentService.sendMessage('testing-specialist', [{
        role: 'user',
        content: `Generate comprehensive tests for this React component: ${componentResponse.content}`
      }]);

      // Generate documentation
      const docResponse = await agentService.sendMessage('frontend-specialist', [{
        role: 'user',
        content: `Generate documentation for this React component including usage examples: ${componentResponse.content}`
      }]);

      const generatedResults: CodeGenerationResult[] = [
        {
          type: 'component',
          title: 'React Component',
          code: componentResponse.content,
          language: 'typescript',
          explanation: 'Generated React component with TypeScript and Tailwind CSS styling',
          suggestions: [
            'Add error boundaries for better error handling',
            'Consider memoization for performance optimization',
            'Add accessibility attributes (ARIA labels)'
          ]
        },
        {
          type: 'test',
          title: 'Test Suite',
          code: testResponse.content,
          language: 'typescript',
          explanation: 'Comprehensive test suite covering component functionality',
          suggestions: [
            'Add integration tests',
            'Test accessibility features',
            'Add performance benchmarks'
          ]
        },
        {
          type: 'documentation',
          title: 'Documentation',
          code: docResponse.content,
          language: 'markdown',
          explanation: 'Complete documentation with usage examples',
          suggestions: [
            'Add interactive examples',
            'Include troubleshooting section',
            'Add migration guides'
          ]
        }
      ];

      setResults(generatedResults);
      
      toast({
        title: 'Code generated successfully',
        description: 'Your code has been generated with tests and documentation',
      });

    } catch (error: any) {
      console.error('Code generation failed:', error);
      
      if (error.message.includes('AI services are not configured')) {
        toast({
          title: 'AI Configuration Required',
          description: 'Please configure either Claude (Anthropic) or Gemini (Google) API keys to use code generation.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Generation failed',
          description: error.message || 'Failed to generate code',
          variant: 'destructive',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      
      toast({
        title: 'Copied to clipboard',
        description: 'Code has been copied to your clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy code to clipboard',
        variant: 'destructive',
      });
    }
  };

  const insertCode = (result: CodeGenerationResult) => {
    const fileExtension = result.language === 'markdown' ? 'md' : 
                         result.language === 'typescript' ? 'tsx' : 'js';
    const fileName = result.type === 'test' ? `${result.title.toLowerCase().replace(/\s+/g, '-')}.test.${fileExtension}` :
                    result.type === 'documentation' ? `README.${fileExtension}` :
                    `${result.title.toLowerCase().replace(/\s+/g, '-')}.${fileExtension}`;
    
    onCodeGenerated(result.code, fileName);
    
    toast({
      title: 'Code inserted',
      description: `${result.title} has been added to your project`,
    });
  };

  const getResultIcon = (type: CodeGenerationResult['type']) => {
    switch (type) {
      case 'component':
        return <CodeIcon className="h-4 w-4" />;
      case 'test':
        return <TestTubeIcon className="h-4 w-4" />;
      case 'documentation':
        return <FileTextIcon className="h-4 w-4" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };

  const getResultColor = (type: CodeGenerationResult['type']) => {
    switch (type) {
      case 'component':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'test':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'documentation':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <SparklesIcon className="h-5 w-5 text-primary" />
          AI Code Generation
        </h3>
        
        <div className="space-y-4">
          <Textarea
            placeholder="Describe what you want to generate (e.g., 'Create a user profile card component with avatar, name, email, and edit button')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          
          <Button 
            onClick={generateCode} 
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
            ) : (
              <WandIcon className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Code'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {results.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8 text-center">
            <div>
              <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">AI Code Generation</h3>
              <p className="text-muted-foreground max-w-md">
                Describe what you want to build and our AI agents will generate complete code with tests and documentation
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full p-4">
            <div className="space-y-6">
              {results.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getResultIcon(result.type)}
                        {result.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getResultColor(result.type)}>
                          {result.type}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result.code, index)}
                        >
                          {copiedIndex === index ? (
                            <CheckIcon className="h-4 w-4" />
                          ) : (
                            <CopyIcon className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => insertCode(result)}
                        >
                          Insert
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.explanation}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <Tabs defaultValue="code">
                      <TabsList>
                        <TabsTrigger value="code">Code</TabsTrigger>
                        <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="code" className="mt-4">
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{result.code}</code>
                          </pre>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="suggestions" className="mt-4">
                        <div className="space-y-2">
                          {result.suggestions.map((suggestion, suggestionIndex) => (
                            <div key={suggestionIndex} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                              <SparklesIcon className="h-4 w-4 text-primary mt-0.5" />
                              <span className="text-sm">{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}