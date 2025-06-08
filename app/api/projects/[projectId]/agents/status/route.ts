import { NextResponse } from 'next/server';
import { agentService } from '@/lib/ai/agents';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    // In production, this would fetch real agent statuses from a database
    const mockStatuses = [
      {
        id: 'frontend-specialist',
        status: 'coding',
        currentTask: 'Implementing UI components',
        progress: 65,
      },
      {
        id: 'backend-specialist',
        status: 'thinking',
        currentTask: 'Designing API endpoints',
        progress: 40,
      },
      // Add more mock statuses as needed
    ];

    return NextResponse.json(mockStatuses);
  } catch (error) {
    console.error('Error fetching agent statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent statuses' },
      { status: 500 }
    );
  }
}