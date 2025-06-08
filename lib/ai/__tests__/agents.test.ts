import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentService } from '../agents';
import type { AIMessage } from '../types';

describe('AgentService', () => {
  let agentService: AgentService;

  beforeEach(() => {
    agentService = AgentService.getInstance();
  });

  describe('sendMessage', () => {
    it('should handle frontend specialist messages', async () => {
      const messages: AIMessage[] = [
        {
          role: 'user',
          content: 'Create a React component for user profile',
        },
      ];

      const response = await agentService.sendMessage('frontend-specialist', messages);
      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
    });

    it('should handle backend specialist messages', async () => {
      const messages: AIMessage[] = [
        {
          role: 'user',
          content: 'Design an API endpoint for user authentication',
        },
      ];

      const response = await agentService.sendMessage('backend-specialist', messages);
      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
    });

    it('should throw error for invalid agent ID', async () => {
      const messages: AIMessage[] = [
        {
          role: 'user',
          content: 'Test message',
        },
      ];

      await expect(agentService.sendMessage('invalid-agent', messages))
        .rejects.toThrow('Agent invalid-agent not found');
    });
  });

  describe('coordinateTask', () => {
    it('should coordinate tasks between agents', async () => {
      const task = 'Create a user authentication system';
      await expect(agentService.coordinateTask(task)).resolves.not.toThrow();
    });

    it('should handle task coordination failures gracefully', async () => {
      vi.spyOn(agentService as any, 'sendMessage').mockRejectedValueOnce(new Error('API Error'));
      const task = 'Invalid task';
      await expect(agentService.coordinateTask(task)).rejects.toThrow();
    });
  });
});