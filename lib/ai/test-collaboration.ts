import { agentService } from './agents';
import type { AIMessage, CodeAnalysis } from './types';

export async function testAgentCollaboration() {
  try {
    // Initial code review by Code Review Specialist
    const reviewMessages: AIMessage[] = [
      {
        role: 'system',
        content: 'Analyze this React component for improvements:',
      },
      {
        role: 'user',
        content: `
          function UserProfile({ user }) {
            return (
              <div>
                <h1>{user.name}</h1>
                <p>{user.email}</p>
                <button onClick={() => alert('Clicked!')}>
                  Edit Profile
                </button>
              </div>
            )
          }
        `,
      },
    ];

    const reviewResponse = await agentService.sendMessage('code-review', reviewMessages);
    console.log('Code Review Analysis:', reviewResponse);

    // Frontend Specialist improves component based on review
    const frontendMessages: AIMessage[] = [
      {
        role: 'system',
        content: 'Improve this component based on the code review:',
      },
      {
        role: 'user',
        content: reviewResponse.content,
      },
    ];

    const frontendResponse = await agentService.sendMessage('frontend-specialist', frontendMessages);
    console.log('Frontend Improvements:', frontendResponse);

    // Testing Specialist creates tests
    const testingMessages: AIMessage[] = [
      {
        role: 'system',
        content: 'Create tests for the improved component:',
      },
      {
        role: 'user',
        content: frontendResponse.content,
      },
    ];

    const testingResponse = await agentService.sendMessage('testing-specialist', testingMessages);
    console.log('Test Suite:', testingResponse);

    return {
      review: reviewResponse,
      improvements: frontendResponse,
      tests: testingResponse,
    };
  } catch (error) {
    console.error('Agent collaboration test failed:', error);
    throw error;
  }
}