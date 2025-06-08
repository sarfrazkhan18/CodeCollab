'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  BrainCircuitIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  LightbulbIcon,
  TrendingUpIcon,
  ShieldIcon,
  ZapIcon,
  RefreshCwIcon,
  WandIcon
} from 'lucide-react';
import { codeAnalyzer, CodeMetrics, CodeIssue, CodeInsight } from '@/lib/intelligence/code-analyzer';
import { useToast } from '@/hooks/use-toast';

interface CodeIntelligencePanelProps {
  currentFile: string | null;
  code: string;
  language: string;
}

export function CodeIntelligencePanel({ currentFile, code, language }: CodeIntelligencePanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState<CodeMetrics | null>(null);
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [insights, setInsights] = useState<CodeInsight | null>(null);
  const [refactoredCode, setRefactoredCode] = useState<string>('');
  const [refactorExplanation, setRefactorExplanation] = useState<string>('');
  const [documentation, setDocumentation] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (currentFile && code) {
      analyzeCode();
    }
  }, [currentFile, code]);

  const analyzeCode = async () => {
    if (!currentFile || !code.trim()) return;

    try {
      setIsAnalyzing(true);
      const analysis = await codeAnalyzer.analyzeCode(code, language, currentFile);
      
      setMetrics(analysis.metrics);
      setIssues(analysis.issues);
      setInsights(analysis.insights);
      
      toast({
        title: 'Code analysis complete',
        description: `Found ${analysis.issues.length} issues and ${analysis.insights.suggestions.length} suggestions`,
      });
    } catch (error) {
      toast({
        title: 'Analysis failed',
        description: 'Failed to analyze code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefactor = async () => {
    if (!code.trim()) return;

    try {
      setIsAnalyzing(true);
      const result = await codeAnalyzer.suggestRefactoring(code, language);
      
      setRefactoredCode(result.refactoredCode);
      setRefactorExplanation(result.explanation);
      
      toast({
        title: 'Refactoring suggestions ready',
        description: 'AI has generated improved code with explanations',
      });
    } catch (error) {
      toast({
        title: 'Refactoring failed',
        description: 'Failed to generate refactoring suggestions',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateDocumentation = async () => {
    if (!code.trim()) return;

    try {
      setIsAnalyzing(true);
      const docs = await codeAnalyzer.generateDocumentation(code, language);
      setDocumentation(docs);
      
      toast({
        title: 'Documentation generated',
        description: 'AI has created comprehensive documentation for your code',
      });
    } catch (error) {
      toast({
        title: 'Documentation generation failed',
        description: 'Failed to generate documentation',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <InfoIcon className="h-4 w-4 text-blue-500" />;
      case 'suggestion':
        return <LightbulbIcon className="h-4 w-4 text-green-500" />;
      default:
        return <InfoIcon className="h-4 w-4" />;
    }
  };

  const getMetricColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!currentFile) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <div>
          <BrainCircuitIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Code Intelligence</h3>
          <p className="text-muted-foreground">
            Select a file to analyze code quality, get suggestions, and generate documentation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <BrainCircuitIcon className="h-5 w-5 text-primary" />
            Code Intelligence
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeCode}
              disabled={isAnalyzing}
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Analyze
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefactor}
              disabled={isAnalyzing}
            >
              <WandIcon className="h-4 w-4 mr-2" />
              Refactor
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Analyzing: {currentFile}
        </p>
      </div>

      <Tabs defaultValue="metrics" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mx-4 mt-2">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="refactor">Refactor</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="flex-1 p-4 space-y-4">
          {isAnalyzing ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-2 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : metrics ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Code Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Complexity</span>
                      <span className={`text-sm font-bold ${getMetricColor(metrics.complexity)}`}>
                        {metrics.complexity}/100
                      </span>
                    </div>
                    <Progress value={metrics.complexity} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Maintainability</span>
                      <span className={`text-sm font-bold ${getMetricColor(metrics.maintainability)}`}>
                        {metrics.maintainability}/100
                      </span>
                    </div>
                    <Progress value={metrics.maintainability} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Performance</span>
                      <span className={`text-sm font-bold ${getMetricColor(metrics.performance)}`}>
                        {metrics.performance}/100
                      </span>
                    </div>
                    <Progress value={metrics.performance} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Security</span>
                      <span className={`text-sm font-bold ${getMetricColor(metrics.security)}`}>
                        {metrics.security}/100
                      </span>
                    </div>
                    <Progress value={metrics.security} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Test Coverage</span>
                      <span className={`text-sm font-bold ${getMetricColor(metrics.testCoverage)}`}>
                        {metrics.testCoverage}/100
                      </span>
                    </div>
                    <Progress value={metrics.testCoverage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUpIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Click "Analyze" to see code metrics</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="issues" className="flex-1 p-4">
          <ScrollArea className="h-full">
            {issues.length > 0 ? (
              <div className="space-y-3">
                {issues.map((issue) => (
                  <Card key={issue.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{issue.message}</span>
                            <Badge variant="outline" className="text-xs">
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Line {issue.line}, Column {issue.column}
                          </p>
                          {issue.suggestedFix && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              <strong>Suggested fix:</strong> {issue.suggestedFix}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="text-muted-foreground">No issues found in your code!</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="insights" className="flex-1 p-4">
          <ScrollArea className="h-full">
            {insights ? (
              <div className="space-y-4">
                {insights.patterns.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        Good Patterns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {insights.patterns.map((pattern, i) => (
                          <li key={i} className="text-sm">{pattern}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {insights.suggestions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <LightbulbIcon className="h-4 w-4 text-yellow-500" />
                        Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {insights.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm">{suggestion}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {insights.performanceImprovements.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ZapIcon className="h-4 w-4 text-blue-500" />
                        Performance Improvements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {insights.performanceImprovements.map((improvement, i) => (
                          <li key={i} className="text-sm">{improvement}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {insights.securityConcerns.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ShieldIcon className="h-4 w-4 text-red-500" />
                        Security Concerns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {insights.securityConcerns.map((concern, i) => (
                          <li key={i} className="text-sm">{concern}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <LightbulbIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Analyze your code to see insights</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="refactor" className="flex-1 p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">AI Refactoring Suggestions</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateDocumentation}
                disabled={isAnalyzing}
              >
                Generate Docs
              </Button>
            </div>

            {refactoredCode ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Refactored Code</CardTitle>
                    <CardDescription>{refactorExplanation}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{refactoredCode}</code>
                    </pre>
                  </CardContent>
                </Card>

                {documentation && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Generated Documentation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm">{documentation}</pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <WandIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">
                  Click "Refactor" to get AI-powered code improvements
                </p>
                <Button onClick={handleRefactor} disabled={isAnalyzing}>
                  {isAnalyzing ? 'Analyzing...' : 'Generate Refactoring Suggestions'}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}