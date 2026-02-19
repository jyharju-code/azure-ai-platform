export type SessionType = "red_vs_blue" | "multi_agent" | "single_agent";
export type SessionStatus = "pending" | "running" | "paused" | "completed" | "failed";
export type MessageRole = "system" | "user" | "assistant" | "tool";

export interface SessionConfig {
  turnOrder?: "sequential" | "parallel";
  mediatorPrompt?: string;
  evaluationCriteria?: string[];
}

export interface CreateSessionInput {
  name: string;
  type: SessionType;
  scenario?: string;
  maxTurns?: number;
  config?: SessionConfig;
  agentIds: Array<{ agentId: string; role?: string }>;
}

export interface ChatRequest {
  modelId: string;
  messages: Array<{ role: MessageRole; content: string }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  finishReason: string;
  latencyMs: number;
}
