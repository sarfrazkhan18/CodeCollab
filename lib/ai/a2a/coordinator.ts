import { A2AContext, A2AMessage, A2AProtocol, A2AStep } from './types';
import { agentService } from '../agents';

export class A2ACoordinator {
  private context: A2AContext;

  constructor(protocol: A2AProtocol) {
    this.context = {
      protocol,
      messages: [],
      artifacts: {},
    };
  }

  async executeProtocol(initialInput: any): Promise<any> {
    const { protocol } = this.context;
    let currentStep = 0;

    try {
      while (currentStep < protocol.steps.length) {
        const step = protocol.steps[currentStep];
        
        // Check if required artifacts are available
        if (step.requires?.some(req => !this.context.artifacts[req])) {
          throw new Error(`Missing required artifacts for step ${step.id}`);
        }

        // Execute step
        const result = await this.executeStep(step, initialInput);
        
        // Store artifacts
        if (step.provides) {
          step.provides.forEach(artifact => {
            this.context.artifacts[artifact] = result;
          });
        }

        currentStep++;
      }

      return this.context.artifacts;
    } catch (error) {
      console.error('Protocol execution failed:', error);
      throw error;
    }
  }

  private async executeStep(step: A2AStep, input: any): Promise<any> {
    const message: A2AMessage = {
      from: 'coordinator',
      to: step.agent,
      content: this.buildPrompt(step, input),
      timestamp: new Date(),
    };

    this.context.messages.push(message);

    const response = await agentService.sendMessage(step.agent, [{
      role: 'user',
      content: message.content,
    }]);

    const responseMessage: A2AMessage = {
      from: step.agent,
      to: 'coordinator',
      content: response.content,
      timestamp: new Date(),
    };

    this.context.messages.push(responseMessage);
    return response.content;
  }

  private buildPrompt(step: A2AStep, input: any): string {
    let prompt = `Task: ${step.task}\n\n`;
    
    if (step.requires) {
      prompt += 'Previous results:\n';
      step.requires.forEach(req => {
        prompt += `\n${req}:\n${this.context.artifacts[req]}\n`;
      });
    }

    prompt += `\nInput:\n${input}`;
    return prompt;
  }

  getContext(): A2AContext {
    return this.context;
  }

  getMessages(): A2AMessage[] {
    return this.context.messages;
  }

  getArtifacts(): Record<string, any> {
    return this.context.artifacts;
  }
}