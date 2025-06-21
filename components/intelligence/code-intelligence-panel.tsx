'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  WandIcon,
  BugIcon,
  PerformanceIcon as SpeedIcon,
  CodeIcon
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
  const [lastAnalyzedFile, setLastAnalyzedFile] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentFile && code && currentFile !== lastAnalyzedFile) {
      analyzeCode();
    }
  }, [currentFile, code]);

  const analyzeCode = async () => {
    if (!currentFile || !code.trim()) return;

    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      
      const analysis = await codeAnalyzer.analyzeCode(code, language, currentFile);
      
      setMetrics(analysis.metrics);
      setIssues(analysis.issues);
      setInsights(analysis.insights);
      setLastAnalyzedFile(currentFile);
      
      toast({
        title: 'Code analysis complete',
        description: `Found ${analysis.issues.length} issues and ${analysis.insights.suggestions.length} suggestions`,
      });
    } catch (error: any) {
      setAnalysisError(error.message || 'Analysis failed');
      toast({
        title: 'Analysis failed',
        description: 'Please check your AI API configuration or try again later.',
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
    } catch (error: any) {
      toast({
        title: 'Refactoring failed',
        description: error.message || 'Failed to generate refactoring suggestions',
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
    } catch (error: any) {
      toast({
        title: 'Documentation generation failed',
        description: error.message || 'Failed to generate documentation',
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

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'complexity':
        return <BrainCircuitIcon className="h-4 w-4" />;
      case 'performance':
        return <ZapIcon className="h-4 w-4" />;
      case 'security':
        return <ShieldIcon className="h-4 w-4" />;
      case 'testCoverage':
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <TrendingUpIcon className="h-4 w-4" />;
    }
  };

  if (!currentFile) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <div>
          <BrainCircuitIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">AI Code Assistant</h3>
          <p className="text-muted-foreground text-sm">
            Select a file to analyze code quality, detect bugs, and get performance optimization suggestions
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
            AI Code Assistant
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeCode}
              disabled={isAnalyzing}
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
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
        {analysisError && (
          <Alert className="mt-2" variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {analysisError}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs defaultValue="metrics" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mx-4 mt-2">
          <TabsTrigger value="metrics">Quality</TabsTrigger>
          <TabsTrigger value="issues">
            <BugIcon className="h-3 w-3 mr-1" />
            Issues
          </TabsTrigger>
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
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5 text-primary" />
                    Code Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(metrics).map(([key, value]) => (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          {getMetricIcon(key)}
                          {key === 'testCoverage' ? 'Test Coverage' : 
                           key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                        <span className={`text-sm font-bold ${getMetricColor(value)}`}>
                          {value}/100
                        </span>
                      </div>
                      <Progress 
                        value={value} 
                        className="h-2" 
                        style={{
                          '--progress-foreground': value >= 80 ? 'hsl(142, 76%, 36%)' : 
                                                 value >= 60 ? 'hsl(45, 93%, 47%)' : 
                                                 'hsl(0, 84%, 60%)'
                        } as React.CSSProperties}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions Based on Metrics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {metrics.complexity > 80 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={handleRefactor}
                    >
                      <BrainCircuitIcon className="h-4 w-4 mr-2" />
                      Reduce Complexity
                    </Button>
                  )}
                  {metrics.performance < 70 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={handleRefactor}
                    >
                      <ZapIcon className="h-4 w-4 mr-2" />
                      Optimize Performance
                    </Button>
                  )}
                  {metrics.testCoverage < 50 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => toast({ title: 'Feature coming soon', description: 'Test generation will be available in the next update' })}
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Generate Tests
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUpIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Click "Analyze" to see code quality metrics</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="issues" className="flex-1 p-4">
          <ScrollArea className="h-full">
            {issues.length > 0 ? (
              <div className="space-y-3">
                {issues.map((issue) => (
                  <Card key={issue.id} className={`border-l-4 ${
                    issue.severity === 'critical' ? 'border-l-red-500' :
                    issue.severity === 'high' ? 'border-l-orange-500' :
                    issue.severity === 'medium' ? 'border-l-yellow-500' :
                    'border-l-blue-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{issue.message}</span>
                            <Badge variant="outline" className="text-xs">
                              {issue.severity}
                            </Badge>
                            {issue.fixable && (
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                                Fixable
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Line {issue.line}, Column {issue.column} • {issue.rule}
                          </p>
                          {issue.suggestedFix && (
                            <div className="mt-2 p-2 bg-muted rounded text-xs">
                              <strong>💡 Suggested fix:</strong> {issue.suggestedFix}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : isAnalyzing ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                <h3 className="font-semibold mb-2">No issues found!</h3>
                <p className="text-muted-foreground text-sm">Your code looks clean and follows best practices.</p>
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
                        Good Patterns Found
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {insights.patterns.map((pattern, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-green-500" />
                            {pattern}
                          </li>
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
                        Improvement Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {insights.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-yellow-500" />
                            {suggestion}
                          </li>
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
                        Performance Optimizations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {insights.performanceImprovements.map((improvement, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            {improvement}
                          </li>
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
                        Security Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {insights.securityConcerns.map((concern, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-red-500" />
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {insights.refactoringOpportunities.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <WandIcon className="h-4 w-4 text-purple-500" />
                        Refactoring Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 mb-3">
                        {insights.refactoringOpportunities.map((opportunity, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-purple-500" />
                            {opportunity}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefactor}
                        disabled={isAnalyzing}
                        className="w-full"
                      >
                        <WandIcon className="h-4 w-4 mr-2" />
                        Get Refactoring Suggestions
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <LightbulbIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Analyze your code to see detailed insights</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="refactor" className="flex-1 p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">AI Refactoring Assistant</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateDocumentation}
                disabled={isAnalyzing}
              >
                <CodeIcon className="h-4 w-4 mr-2" />
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
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm code-font">
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
                        <pre className="whitespace-pre-wrap text-sm code-font">{documentation}</pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <WandIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">AI-Powered Refactoring</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Get intelligent code improvements, performance optimizations, and best practice suggestions
                </p>
                <Button onClick={handleRefactor} disabled={isAnalyzing} size="lg">
                  {isAnalyzing ? (
                    <div className="loading-dots mr-2">
                      <div style={{'--i': 0} as React.CSSProperties}></div>
                      <div style={{'--i': 1} as React.CSSProperties}></div>
                      <div style={{'--i': 2} as React.CSSProperties}></div>
                    </div>
                  ) : (
                    <WandIcon className="h-4 w-4 mr-2" />
                  )}
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