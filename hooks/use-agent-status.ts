import { useState, useEffect } from 'react';
import type { AgentStatus } from '@/lib/ai/types';

export function useAgentStatus(projectId: string) {
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchAgentStatuses = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/agents/status`);
        if (!response.ok) throw new Error('Failed to fetch agent statuses');
        
        const data = await response.json();
        if (mounted) {
          setAgentStatuses(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setIsLoading(false);
        }
      }
    };

    // In production, this would use WebSocket
    fetchAgentStatuses();
    const interval = setInterval(fetchAgentStatuses, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [projectId]);

  return { agentStatuses, isLoading, error };
}