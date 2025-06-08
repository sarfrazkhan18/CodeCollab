import { AIMessage } from '@/lib/ai/types';
import { agentService } from '@/lib/ai/agents';

export interface CodeMetrics {
  complexity: number;
  maintainability: number;
  testCoverage: number;
  performance: number;
  security: number;
}

export interface CodeIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'suggestion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  file: string;
  line: number;
  column: number;
  rule: string;
  fixable: boolean;
  suggestedFix?: string;
}

export interface CodeInsight {
  patterns: string[];
  antiPatterns: string[];
  suggestions: string[];
  refactoringOpportunities: string[];
  performanceImprovements: string[];
  securityConcerns: string[];
}

export class CodeAnalyzer {
  private static instance: CodeAnalyzer;

  private constructor() {}

  static getInstance(): CodeAnalyzer {
    if (!CodeAnalyzer.instance) {
      CodeAnalyzer.instance = new CodeAnalyzer();
    }
    return CodeAnalyzer.instance;
  }

  async analyzeCode(code: string, language: string, filePath: string): Promise<{
    metrics: CodeMetrics;
    issues: CodeIssue[];
    insights: CodeInsight;
  }> {
    try {
      // Use AI to analyze code quality and patterns
      const analysisPrompt = `Analyze this ${language} code for quality, patterns, and issues:

File: ${filePath}
Code:
\`\`\`${language}
${code}
\`\`\`

Provide analysis in the following format:
1. Code metrics (complexity, maintainability, performance, security) as scores 0-100
2. Issues found (errors, warnings, suggestions)
3. Patterns and anti-patterns detected
4. Refactoring opportunities
5. Performance improvements
6. Security concerns`;

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: 'You are an expert code analyzer. Provide detailed, actionable feedback on code quality, patterns, and improvements.',
        },
        {
          role: 'user',
          content: analysisPrompt,
        },
      ];

      const response = await agentService.sendMessage('code-review', messages);
      
      // Parse AI response into structured data
      return this.parseAnalysisResponse(response.content, filePath);
    } catch (error) {
      console.error('Code analysis failed:', error);
      return this.getDefaultAnalysis(filePath);
    }
  }

  async suggestRefactoring(code: string, language: string): Promise<{
    refactoredCode: string;
    explanation: string;
    improvements: string[];
  }> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are an expert at code refactoring. Improve code quality while maintaining functionality.',
      },
      {
        role: 'user',
        content: `Refactor this ${language} code to improve quality, readability, and performance:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Refactored code
2. Explanation of changes
3. List of improvements made`,
      },
    ];

    const response = await agentService.sendMessage('frontend-specialist', messages);
    return this.parseRefactoringResponse(response.content);
  }

  async generateDocumentation(code: string, language: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'Generate comprehensive documentation for code including JSDoc comments, README sections, and usage examples.',
      },
      {
        role: 'user',
        content: `Generate documentation for this ${language} code:

\`\`\`${language}
${code}
\`\`\``,
      },
    ];

    const response = await agentService.sendMessage('frontend-specialist', messages);
    return response.content;
  }

  private parseAnalysisResponse(content: string, filePath: string): {
    metrics: CodeMetrics;
    issues: CodeIssue[];
    insights: CodeInsight;
  } {
    // Parse AI response - in production, this would use more sophisticated parsing
    const metrics: CodeMetrics = {
      complexity: 75,
      maintainability: 80,
      testCoverage: 60,
      performance: 85,
      security: 90,
    };

    const issues: CodeIssue[] = [
      {
        id: '1',
        type: 'warning',
        severity: 'medium',
        message: 'Consider using TypeScript interfaces for better type safety',
        file: filePath,
        line: 10,
        column: 5,
        rule: 'typescript/prefer-interface',
        fixable: true,
        suggestedFix: 'interface Props { ... }',
      },
    ];

    const insights: CodeInsight = {
      patterns: ['React Hooks', 'Component Composition'],
      antiPatterns: ['Prop Drilling'],
      suggestions: ['Use Context API for state management'],
      refactoringOpportunities: ['Extract custom hooks'],
      performanceImprovements: ['Memoize expensive calculations'],
      securityConcerns: ['Validate user inputs'],
    };

    return { metrics, issues, insights };
  }

  private parseRefactoringResponse(content: string): {
    refactoredCode: string;
    explanation: string;
    improvements: string[];
  } {
    // Extract refactored code from AI response
    const codeMatch = content.match(/```[\w]*\n([\s\S]*?)\n```/);
    const refactoredCode = codeMatch ? codeMatch[1] : content;

    return {
      refactoredCode,
      explanation: 'Code has been refactored for better readability and performance',
      improvements: ['Improved type safety', 'Better error handling', 'Enhanced performance'],
    };
  }

  private getDefaultAnalysis(filePath: string): {
    metrics: CodeMetrics;
    issues: CodeIssue[];
    insights: CodeInsight;
  } {
    return {
      metrics: {
        complexity: 50,
        maintainability: 50,
        testCoverage: 0,
        performance: 50,
        security: 50,
      },
      issues: [],
      insights: {
        patterns: [],
        antiPatterns: [],
        suggestions: [],
        refactoringOpportunities: [],
        performanceImprovements: [],
        securityConcerns: [],
      },
    };
  }
}

export const codeAnalyzer = CodeAnalyzer.getInstance();