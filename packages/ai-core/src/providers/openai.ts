import OpenAI from "openai";
import { BaseProvider, type ProviderChatOptions, type ProviderChatResult, type ProviderMessage } from "./base";

export class OpenAIProvider extends BaseProvider {
  readonly name = "openai";

  async chat(
    modelId: string,
    messages: ProviderMessage[],
    apiKey: string,
    options?: ProviderChatOptions,
  ): Promise<ProviderChatResult> {
    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: modelId,
      messages: messages.map((m) => ({ role: m.role as "system" | "user" | "assistant", content: m.content })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    });

    const choice = response.choices[0];
    return {
      content: choice?.message?.content ?? "",
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
      finishReason: choice?.finish_reason ?? "stop",
    };
  }

  async *chatStream(
    modelId: string,
    messages: ProviderMessage[],
    apiKey: string,
    options?: ProviderChatOptions,
  ): AsyncIterable<string> {
    const client = new OpenAI({ apiKey });

    const stream = await client.chat.completions.create({
      model: modelId,
      messages: messages.map((m) => ({ role: m.role as "system" | "user" | "assistant", content: m.content })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }
}
