export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type AIModel = 
  | 'claude-sonnet-4-20250514'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'gemini-1.5-pro'
  | 'gpt-4';

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  model: AIModel;
  specialization: 'frontend' | 'backend' | 'database' | 'testing' | 'coordinator' | 'code-review';
  temperature: number;
  capabilities: string[];
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  suggestions?: CodeSuggestion[];
}

export interface AgentStatus {
  id: string;
  status: 'idle' | 'thinking' | 'coding' | 'collaborating' | 'reviewing';
  currentTask: string;
  progress: number;
  collaboratingWith?: string[];
  lastMessage?: string;
}

export interface CodeSuggestion {
  code: string;
  explanation: string;
  path: string;
  language: string;
  type: 'improvement' | 'bug-fix' | 'feature' | 'performance' | 'security';
  confidence: number;
  lineStart?: number;
  lineEnd?: number;
}

export interface CodeAnalysis {
  quality: {
    score: number;
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      line: number;
    }>;
  };
  suggestions: CodeSuggestion[];
  documentation: {
    missing: string[];
    improvements: string[];
  };
}

export interface AgentTask {
  id: string;
  agentId: string;
  type: 'analysis' | 'suggestion' | 'review' | 'documentation';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  input: any;
  output?: any;
  created_at: Date;
  completed_at?: Date;
}