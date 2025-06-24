import { AIAgent } from './types';

export const AI_CONFIG = {
  claude: {
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    baseUrl: process.env.ANTHROPIC_API_BASE || 'https://api.anthropic.com/v1',
  },
  gemini: {
    model: 'models/gemini-pro',
    maxTokens: 8192,
    baseUrl: process.env.GOOGLE_AI_BASE || 'https://generativelanguage.googleapis.com',
  },
};

export const AI_AGENTS: AIAgent[] = [
  {
    id: 'frontend-specialist',
    name: 'Frontend Specialist',
    description: 'Expert in React, TypeScript, and modern web development',
    model: 'claude-sonnet-4-20250514',
    specialization: 'frontend',
    temperature: 0.3,
    capabilities: ['code-review', 'component-design', 'accessibility', 'performance-optimization'],
  },
  {
    id: 'backend-specialist',
    name: 'Backend Specialist',
    description: 'Expert in API design and server-side architecture',
    model: 'claude-sonnet-4-20250514',
    specialization: 'backend',
    temperature: 0.2,
    capabilities: ['api-design', 'security-review', 'performance-optimization', 'database-integration'],
  },
  {
    id: 'database-specialist',
    name: 'Database Specialist',
    description: 'Expert in database design and optimization',
    model: 'models/gemini-pro',
    specialization: 'database',
    temperature: 0.1,
    capabilities: ['schema-design', 'query-optimization', 'data-modeling', 'migration-planning'],
  },
  {
    id: 'testing-specialist',
    name: 'Testing Specialist',
    description: 'Expert in test automation and quality assurance',
    model: 'models/gemini-pro',
    specialization: 'testing',
    temperature: 0.4,
    capabilities: ['test-planning', 'test-automation', 'coverage-analysis', 'integration-testing'],
  },
  {
    id: 'code-review',
    name: 'Code Review Specialist',
    description: 'Expert in code quality, patterns, and best practices',
    model: 'claude-sonnet-4-20250514',
    specialization: 'code-review',
    temperature: 0.2,
    capabilities: ['code-analysis', 'pattern-detection', 'security-audit', 'documentation-review'],
  },
  {
    id: 'ai-coordinator',
    name: 'AI Coordinator',
    description: 'Expert in orchestrating agent collaboration and workflow management',
    model: 'models/gemini-pro',
    specialization: 'coordinator',
    temperature: 0.5,
    capabilities: ['task-delegation', 'workflow-optimization', 'conflict-resolution', 'progress-tracking'],
  },
];