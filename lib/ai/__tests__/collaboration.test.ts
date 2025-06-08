import { describe, it, expect, vi } from 'vitest';
import { testAgentCollaboration } from '../test-collaboration';

describe('Agent Collaboration', () => {
  it('should successfully complete a collaboration test', async () => {
    const result = await testAgentCollaboration();
    
    expect(result).toHaveProperty('review');
    expect(result).toHaveProperty('improvements');
    expect(result).toHaveProperty('tests');
    
    expect(result.review.content).toBeTruthy();
    expect(result.improvements.content).toBeTruthy();
    expect(result.tests.content).toBeTruthy();
  });

  it('should handle collaboration failures gracefully', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock a failure in the collaboration process
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
    
    await expect(testAgentCollaboration()).rejects.toThrow();
  });
});