import type { ChatRequest, ChatResponse, MessageRole } from "@repo/types";

export interface ProviderMessage {
  role: MessageRole;
  content: string;
}

export interface ProviderChatOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ProviderChatResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
  finishReason: string;
}

export abstract class BaseProvider {
  abstract readonly name: string;

  abstract chat(
    modelId: string,
    messages: ProviderMessage[],
    apiKey: string,
    options?: ProviderChatOptions,
  ): Promise<ProviderChatResult>;

  abstract chatStream(
    modelId: string,
    messages: ProviderMessage[],
    apiKey: string,
    options?: ProviderChatOptions,
  ): AsyncIterable<string>;
}
