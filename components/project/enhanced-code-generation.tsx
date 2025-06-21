'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WandIcon, CodeIcon, FileIcon, TestTubeIcon, FileTextIcon, SparklesIcon, CopyIcon, CheckIcon, BookOpenIcon, PlayIcon } from 'lucide-react';
import { agentService } from '@/lib/ai/agents';
import { useToast } from '@/hooks/use-toast';

interface CodeGenerationResult {
  type: 'component' | 'hook' | 'utility' | 'test' | 'documentation';
  title: string;
  code: string;
  language: string;
  explanation: string;
  suggestions: string[];
  filePath: string;
}

interface EnhancedCodeGenerationProps {
  projectId: string;
  onCodeGenerated: (code: string, filePath: string) => void;
}

type CodeType = 'component' | 'hook' | 'utility' | 'test' | 'documentation' | 'api' | 'config';

interface CodeTypeConfig {
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultPath: string;
  extension: string;
  agentId: string;
  promptTemplate: string;
}

// Helper function to transform string to hook icon
function CustomHookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
  );
}

function CustomComponentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function CustomUtilityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

const CODE_TYPES: Record<CodeType, CodeTypeConfig> = {
  component: {
    label: 'React Component',
    description: 'UI components with props and state',
    icon: <CustomComponentIcon className="h-4 w-4" />,
    defaultPath: 'components',
    extension: 'tsx',
    agentId: 'frontend-specialist',
    promptTemplate: 'Create a React component with TypeScript and Tailwind CSS that'
  },
  hook: {
    label: 'Custom Hook',
    description: 'Reusable React hooks',
    icon: <CustomHookIcon className="h-4 w-4" />,
    defaultPath: 'hooks',
    extension: 'ts',
    agentId: 'frontend-specialist',
    promptTemplate: 'Create a custom React hook with TypeScript that'
  },
  utility: {
    label: 'Utility Function',
    description: 'Helper functions and utilities',
    icon: <CustomUtilityIcon className="h-4 w-4" />,
    defaultPath: 'lib/utils',
    extension: 'ts',
    agentId: 'backend-specialist',
    promptTemplate: 'Create a utility function with TypeScript that'
  },
  test: {
    label: 'Test Suite',
    description: 'Unit and integration tests',
    icon: <TestTubeIcon className="h-4 w-4" />,
    defaultPath: '__tests__',
    extension: 'test.ts',
    agentId: 'testing-specialist',
    promptTemplate: 'Create comprehensive tests using Jest and Testing Library that'
  },
  documentation: {
    label: 'Documentation',
    description: 'README files and docs',
    icon: <FileTextIcon className="h-4 w-4" />,
    defaultPath: 'docs',
    extension: 'md',
    agentId: 'frontend-specialist',
    promptTemplate: 'Create comprehensive documentation that'
  },
  api: {
    label: 'API Route',
    description: 'Backend API endpoints',
    icon: <PlayIcon className="h-4 w-4" />,
    defaultPath: 'app/api',
    extension: 'ts',
    agentId: 'backend-specialist',
    promptTemplate: 'Create a Next.js API route with TypeScript that'
  },
  config: {
    label: 'Configuration',
    description: 'Config files and settings',
    icon: <FileIcon className="h-4 w-4" />,
    defaultPath: '',
    extension: 'ts',
    agentId: 'backend-specialist',
    promptTemplate: 'Create a configuration file that'
  }
};

export function EnhancedCodeGeneration({ projectId, onCodeGenerated }: EnhancedCodeGenerationProps) {
  const [prompt, setPrompt] = useState('');
  const [codeType, setCodeType] = useState<CodeType>('component');
  const [filePathSuggestion, setFilePathSuggestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<CodeGenerationResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const { toast } = useToast();

  const generateCode = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt required',
        description: 'Please describe what you want to generate',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);
      setResults([]);
      
      const typeConfig = CODE_TYPES[codeType];
      setActiveAgent(typeConfig.agentId);

      // Enhanced prompt generation based on code type
      const enhancedPrompt = `${typeConfig.promptTemplate} ${prompt}.

Code Type: ${typeConfig.label}
${filePathSuggestion ? `Suggested file path: ${filePathSuggestion}` : ''}

Requirements:
- Follow TypeScript best practices
- Include proper error handling
- Add comprehensive JSDoc comments
- Follow the project's coding standards
- ${codeType === 'component' ? 'Use Tailwind CSS for styling and include proper prop types' : ''}
- ${codeType === 'hook' ? 'Include proper dependency arrays and cleanup functions' : ''}
- ${codeType === 'test' ? 'Include unit tests, integration tests, and edge cases' : ''}
- ${codeType === 'api' ? 'Include proper HTTP status codes and error responses' : ''}

Please provide clean, production-ready code with explanations.`;

      // Generate main code
      const codeResponse = await agentService.sendMessage(typeConfig.agentId, [{
        role: 'user',
        content: enhancedPrompt
      }]);

      // Generate file path if not provided
      const filePath = generateFilePath(codeType, filePathSuggestion, prompt);

      const mainResult: CodeGenerationResult = {
        type: codeType,
        title: generateTitle(codeType, prompt),
        code: extractCode(codeResponse.content),
        language: typeConfig.extension === 'md' ? 'markdown' : 'typescript',
        explanation: extractExplanation(codeResponse.content),
        suggestions: generateSuggestions(codeType),
        filePath
      };

      const generatedResults = [mainResult];

      // Generate complementary files based on code type
      if (codeType === 'component') {
        // Generate test file for component
        try {
          const testResponse = await agentService.sendMessage('testing-specialist', [{
            role: 'user',
            content: `Generate comprehensive tests for this React component:\n\n${mainResult.code}\n\nInclude unit tests, integration tests, and accessibility tests.`
          }]);

          generatedResults.push({
            type: 'test',
            title: `${generateTitle(codeType, prompt)} Tests`,
            code: extractCode(testResponse.content),
            language: 'typescript',
            explanation: 'Comprehensive test suite for the component',
            suggestions: ['Run tests with npm test', 'Add more edge cases', 'Include visual regression tests'],
            filePath: filePath.replace('.tsx', '.test.tsx')
          });
        } catch (error) {
          console.warn('Failed to generate tests:', error);
        }
      }

      if (codeType === 'hook') {
        // Generate example usage for hook
        try {
          const exampleResponse = await agentService.sendMessage('frontend-specialist', [{
            role: 'user',
            content: `Create an example React component that demonstrates how to use this custom hook:\n\n${mainResult.code}`
          }]);

          generatedResults.push({
            type: 'component',
            title: `${generateTitle(codeType, prompt)} Example`,
            code: extractCode(exampleResponse.content),
            language: 'typescript',
            explanation: 'Example component demonstrating hook usage',
            suggestions: ['Customize for your use case', 'Add error states', 'Include loading states'],
            filePath: filePath.replace('/hooks/', '/examples/').replace('.ts', 'Example.tsx')
          });
        } catch (error) {
          console.warn('Failed to generate example:', error);
        }
      }

      setResults(generatedResults);
      
      toast({
        title: 'Code generated successfully',
        description: `Generated ${generatedResults.length} file(s) for your ${typeConfig.label.toLowerCase()}`,
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
      setActiveAgent(null);
    }
  };

  const generateFilePath = (type: CodeType, suggestion: string, prompt: string): string => {
    if (suggestion.trim()) {
      // Use user's suggestion, ensure it has the correct extension
      const config = CODE_TYPES[type];
      if (!suggestion.includes('.')) {
        return `${suggestion}.${config.extension}`;
      }
      return suggestion;
    }

    // Generate default path based on type and prompt
    const config = CODE_TYPES[type];
    const baseName = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .slice(0, 3)
      .join('-')
      .replace(/\s+/g, '-');

    if (config.defaultPath) {
      return `${config.defaultPath}/${baseName}.${config.extension}`;
    }
    return `${baseName}.${config.extension}`;
  };

  const generateTitle = (type: CodeType, prompt: string): string => {
    const config = CODE_TYPES[type];
    const words = prompt.split(' ').slice(0, 3);
    const title = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return `${title} ${config.label}`;
  };

  const generateSuggestions = (type: CodeType): string[] => {
    const baseSuggestions = [
      'Review and test the generated code',
      'Customize according to your needs',
      'Add proper error handling'
    ];

    const typeSuggestions = {
      component: ['Add prop validation', 'Include accessibility attributes', 'Consider memoization'],
      hook: ['Add proper cleanup', 'Include dependency arrays', 'Add error boundaries'],
      utility: ['Add unit tests', 'Include input validation', 'Consider edge cases'],
      test: ['Add more test cases', 'Include integration tests', 'Test error scenarios'],
      documentation: ['Add code examples', 'Include troubleshooting', 'Add API references'],
      api: ['Add input validation', 'Include rate limiting', 'Add proper logging'],
      config: ['Validate configuration', 'Add environment checks', 'Include defaults']
    };

    return [...baseSuggestions, ...typeSuggestions[type]];
  };

  const extractCode = (content: string): string => {
    const codeMatch = content.match(/```[\w]*\n([\s\S]*?)\n```/);
    return codeMatch ? codeMatch[1].trim() : content.trim();
  };

  const extractExplanation = (content: string): string => {
    // Extract explanation from AI response (before or after code block)
    const parts = content.split('```');
    if (parts.length >= 3) {
      return (parts[0] + parts[2]).trim();
    }
    return 'Code generated successfully with best practices applied.';
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
    onCodeGenerated(result.code, result.filePath);
    
    toast({
      title: 'Code inserted',
      description: `${result.title} has been added to ${result.filePath}`,
    });
  };

  const getResultIcon = (type: CodeGenerationResult['type']) => {
    return CODE_TYPES[type]?.icon || <FileIcon className="h-4 w-4" />;
  };

  const getResultColor = (type: CodeGenerationResult['type']) => {
    const colors = {
      component: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      hook: 'bg-green-500/10 text-green-500 border-green-500/20',
      utility: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      test: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      documentation: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      api: 'bg-red-500/10 text-red-500 border-red-500/20',
      config: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    };
    return colors[type] || colors.component;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <SparklesIcon className="h-5 w-5 text-primary" />
          AI Code Generation
          {activeAgent && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              {activeAgent.replace('-', ' ')}
            </Badge>
          )}
        </h3>
        
        <div className="space-y-4">
          {/* Code Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="codeType">What do you want to generate?</Label>
            <Select value={codeType} onValueChange={(value: CodeType) => setCodeType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select code type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CODE_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {config.icon}
                      <div>
                        <div className="font-medium">{config.label}</div>
                        <div className="text-xs text-muted-foreground">{config.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Path Suggestion */}
          <div className="space-y-2">
            <Label htmlFor="filePath">File path (optional)</Label>
            <Input
              id="filePath"
              placeholder={`e.g., ${CODE_TYPES[codeType].defaultPath}/my-${codeType}.${CODE_TYPES[codeType].extension}`}
              value={filePathSuggestion}
              onChange={(e) => setFilePathSuggestion(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-generate based on your description
            </p>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Description</Label>
            <Textarea
              id="prompt"
              placeholder={`Describe your ${CODE_TYPES[codeType].label.toLowerCase()}... (e.g., "handles user authentication with login and logout functionality")`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
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
            {isGenerating ? 'Generating...' : `Generate ${CODE_TYPES[codeType].label}`}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {results.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8 text-center">
            <div>
              <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Enhanced AI Code Generation</h3>
              <p className="text-muted-foreground max-w-md">
                Choose a code type, describe what you need, and let our specialized AI agents create production-ready code with tests and documentation
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {Object.entries(CODE_TYPES).slice(0, 4).map(([key, config]) => (
                  <Badge 
                    key={key} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => setCodeType(key as CodeType)}
                  >
                    {config.icon}
                    <span className="ml-1">{config.label}</span>
                  </Badge>
                ))}
              </div>
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
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{result.explanation}</p>
                      <p className="text-xs text-muted-foreground font-mono">📁 {result.filePath}</p>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Tabs defaultValue="code">
                      <TabsList>
                        <TabsTrigger value="code">Code</TabsTrigger>
                        <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="code" className="mt-4">
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm code-font max-h-96">
                            <code>{result.code}</code>
                          </pre>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="suggestions" className="mt-4">
                        <div className="space-y-2">
                          {result.suggestions.map((suggestion, suggestionIndex) => (
                            <div key={suggestionIndex} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                              <SparklesIcon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
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