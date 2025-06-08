import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG, AI_AGENTS } from './config';
import { A2ACoordinator } from './a2a/coordinator';
import { CODE_REVIEW_PROTOCOL, DATABASE_DESIGN_PROTOCOL } from './a2a/protocols';
import type { AIAgent, AIMessage, AIResponse } from './types';

// Create AI clients with error handling
const createAIClients = () => {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
  const googleAiApiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;

  if (!anthropicApiKey && !googleAiApiKey) {
    console.warn('No AI API keys available. Please configure either ANTHROPIC_API_KEY or GOOGLE_AI_API_KEY.');
    return { anthropic: null, genAI: null };
  }

  return {
    anthropic: anthropicApiKey ? new Anthropic({ apiKey: anthropicApiKey }) : null,
    genAI: googleAiApiKey ? new GoogleGenerativeAI(googleAiApiKey) : null
  };
};

const { anthropic, genAI } = createAIClients();

export class AgentService {
  private static instance: AgentService;
  private agents: Map<string, AIAgent>;

  private constructor() {
    this.agents = new Map(AI_AGENTS.map(agent => [agent.id, agent]));
  }

  static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  async sendMessage(agentId: string, messages: AIMessage[]): Promise<AIResponse> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Check if any AI service is available
    if (!anthropic && !genAI) {
      // Return a mock response when no API keys are configured
      console.warn('AI services not configured. Returning mock response.');
      return {
        content: 'AI services are not configured. Please add your API keys to the environment variables.',
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    }

    // Try Claude first if available and configured
    if (agent.model.startsWith('claude') && anthropic) {
      try {
        return await this.sendClaudeMessage(agent, messages);
      } catch (error: any) {
        console.warn('Claude API error:', error?.message || error);
        // If Claude fails, try Gemini as fallback
        if (genAI) {
          console.log('Falling back to Gemini...');
          return this.sendGeminiMessage(agent, messages);
        }
        throw error;
      }
    }

    // Try Gemini if available
    if (genAI) {
      try {
        return await this.sendGeminiMessage(agent, messages);
      } catch (error: any) {
        console.error('Gemini API error:', error);
        throw new Error(`Gemini API error: ${error?.message || 'Unknown error'}`);
      }
    }

    throw new Error('No AI services are properly configured. Please check your API keys and try again.');
  }

  private async sendClaudeMessage(agent: AIAgent, messages: AIMessage[]): Promise<AIResponse> {
    if (!anthropic) {
      throw new Error('Claude API not configured');
    }

    try {
      const response = await anthropic.messages.create({
        model: agent.model,
        max_tokens: AI_CONFIG.claude.maxTokens,
        temperature: agent.temperature,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      return {
        content: response.content[0].text,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error: any) {
      if (error?.message?.includes('credit balance')) {
        throw new Error('Insufficient Claude API credits. Attempting to use Gemini as fallback...');
      }
      throw error;
    }
  }

  private async sendGeminiMessage(agent: AIAgent, messages: AIMessage[]): Promise<AIResponse> {
    if (!genAI) {
      throw new Error('Gemini API not configured');
    }

    try {
      // Use the model specified in the agent configuration instead of hardcoding 'gemini-pro'
      const model = genAI.getGenerativeModel({ model: agent.model });
      
      const prompt = messages
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n');

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error: any) {
      throw new Error(`Gemini API error: ${error?.message || 'Unknown error'}`);
    }
  }

  async coordinateTask(task: string): Promise<void> {
    const coordinator = this.agents.get('ai-coordinator');
    if (!coordinator) {
      throw new Error('AI Coordinator not found');
    }

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the AI Coordinator. Your task is to: ${task}`,
      },
    ];

    try {
      const response = await this.sendMessage('ai-coordinator', messages);
      const subtasks = this.parseCoordinatorResponse(response.content);
      
      await Promise.all(
        subtasks.map(async (subtask) => {
          const { agentId, task } = subtask;
          await this.sendMessage(agentId, [
            {
              role: 'user',
              content: task,
            },
          ]);
        })
      );
    } catch (error) {
      console.error('Task coordination failed:', error);
      throw new Error('Failed to coordinate task. Please ensure at least one AI service (Claude or Gemini) is properly configured.');
    }
  }

  private parseCoordinatorResponse(content: string): Array<{ agentId: string; task: string }> {
    return content.split('\n')
      .filter(line => line.includes(':'))
      .map(line => {
        const [agentId, task] = line.split(':').map(s => s.trim());
        return { agentId, task };
      });
  }

  async startProtocol(protocolName: string, input: any): Promise<any> {
    const protocol = this.getProtocol(protocolName);
    const coordinator = new A2ACoordinator(protocol);
    return coordinator.executeProtocol(input);
  }

  private getProtocol(name: string) {
    switch (name) {
      case 'code-review':
        return CODE_REVIEW_PROTOCOL;
      case 'database-design':
        return DATABASE_DESIGN_PROTOCOL;
      default:
        throw new Error(`Unknown protocol: ${name}`);
    }
  }
}

export const agentService = AgentService.getInstance();