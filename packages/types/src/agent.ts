export type AgentType = "red_team" | "blue_team" | "general" | "custom";
export type AgentStatus = "idle" | "running" | "paused" | "error" | "stopped";

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AgentConfig {
  autoReply?: boolean;
  maxTurns?: number;
  stopSequences?: string[];
  responseFormat?: "text" | "json";
  retryOnError?: boolean;
  fallbackModelId?: string;
}

export interface CreateAgentInput {
  name: string;
  description?: string;
  type: AgentType;
  modelId: string;
  systemPrompt: string;
  temperature?: string;
  maxTokens?: number;
  tools?: AgentToolDefinition[];
  config?: AgentConfig;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  modelId?: string;
  systemPrompt?: string;
  temperature?: string;
  maxTokens?: number;
  tools?: AgentToolDefinition[];
  config?: AgentConfig;
}
