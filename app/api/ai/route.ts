import { NextResponse } from 'next/server';
import { agentService } from '@/lib/ai/agents';
import { AIMessage } from '@/lib/ai/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, messages } = body as { agentId: string; messages: AIMessage[] };

    if (!agentId || !messages) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      const response = await agentService.sendMessage(agentId, messages);
      return NextResponse.json(response);
    } catch (error: any) {
      // Handle specific AI service errors
      if (error.message.includes('credit balance') || error.message.includes('API not configured')) {
        return NextResponse.json(
          { error: error.message },
          { status: 503 } // Service Unavailable
        );
      }
      throw error; // Re-throw other errors to be caught by the outer catch block
    }
  } catch (error: any) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { task } = body as { task: string };

    if (!task) {
      return NextResponse.json(
        { error: 'Missing task description' },
        { status: 400 }
      );
    }

    try {
      await agentService.coordinateTask(task);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      if (error.message.includes('AI service availability')) {
        return NextResponse.json(
          { error: error.message },
          { status: 503 } // Service Unavailable
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('AI Coordination error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}