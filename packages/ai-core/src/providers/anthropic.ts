import Anthropic from "@anthropic-ai/sdk";
import { BaseProvider, type ProviderChatOptions, type ProviderChatResult, type ProviderMessage } from "./base";

export class AnthropicProvider extends BaseProvider {
  readonly name = "anthropic";

  async chat(
    modelId: string,
    messages: ProviderMessage[],
    apiKey: string,
    options?: ProviderChatOptions,
  ): Promise<ProviderChatResult> {
    const client = new Anthropic({ apiKey });

    // Separate system message from conversation messages
    const systemMessage = messages.find((m) => m.role === "system");
    const conversationMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const response = await client.messages.create({
      model: modelId,
      system: systemMessage?.content,
      messages: conversationMessages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return {
      content: textBlock?.type === "text" ? textBlock.text : "",
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      finishReason: response.stop_reason ?? "end_turn",
    };
  }

  async *chatStream(
    modelId: string,
    messages: ProviderMessage[],
    apiKey: string,
    options?: ProviderChatOptions,
  ): AsyncIterable<string> {
    const client = new Anthropic({ apiKey });

    const systemMessage = messages.find((m) => m.role === "system");
    const conversationMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const stream = client.messages.stream({
      model: modelId,
      system: systemMessage?.content,
      messages: conversationMessages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
  }
}
