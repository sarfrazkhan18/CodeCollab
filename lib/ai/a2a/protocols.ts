import { A2AProtocol } from './types';

export const CODE_REVIEW_PROTOCOL: A2AProtocol = {
  name: 'code-review',
  description: 'Protocol for collaborative code review and improvement',
  steps: [
    {
      id: 'analyze',
      agent: 'code-review',
      task: 'Analyze code structure and patterns',
      provides: ['analysis'],
    },
    {
      id: 'improve',
      agent: 'frontend-specialist',
      task: 'Suggest implementation improvements',
      requires: ['analysis'],
      provides: ['improvements'],
    },
    {
      id: 'test',
      agent: 'testing-specialist',
      task: 'Generate test cases',
      requires: ['improvements'],
      provides: ['tests'],
    },
    {
      id: 'integrate',
      agent: 'ai-coordinator',
      task: 'Integrate all improvements',
      requires: ['analysis', 'improvements', 'tests'],
      provides: ['final-solution'],
    },
  ],
};

export const DATABASE_DESIGN_PROTOCOL: A2AProtocol = {
  name: 'database-design',
  description: 'Protocol for collaborative database schema design',
  steps: [
    {
      id: 'model',
      agent: 'database-specialist',
      task: 'Design data model and relationships',
      provides: ['schema'],
    },
    {
      id: 'optimize',
      agent: 'database-specialist',
      task: 'Optimize schema and indexes',
      requires: ['schema'],
      provides: ['optimized-schema'],
    },
    {
      id: 'validate',
      agent: 'backend-specialist',
      task: 'Validate API integration',
      requires: ['optimized-schema'],
      provides: ['validation'],
    },
    {
      id: 'finalize',
      agent: 'ai-coordinator',
      task: 'Finalize database design',
      requires: ['schema', 'optimized-schema', 'validation'],
      provides: ['final-schema'],
    },
  ],
};