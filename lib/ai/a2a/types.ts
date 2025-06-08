import { AIMessage } from '../types';

export interface A2AMessage {
  from: string;
  to: string;
  content: string;
  context?: Record<string, any>;
  timestamp: Date;
}

export interface A2AProtocol {
  name: string;
  description: string;
  steps: A2AStep[];
}

export interface A2AStep {
  id: string;
  agent: string;
  task: string;
  requires?: string[];
  provides?: string[];
}

export interface A2AContext {
  protocol: A2AProtocol;
  messages: A2AMessage[];
  artifacts: Record<string, any>;
}