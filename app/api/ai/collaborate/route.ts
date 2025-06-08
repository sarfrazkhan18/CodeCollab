import { NextResponse } from 'next/server';
import { testAgentCollaboration } from '@/lib/ai/test-collaboration';

export async function POST(request: Request) {
  try {
    const result = await testAgentCollaboration();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Collaboration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}