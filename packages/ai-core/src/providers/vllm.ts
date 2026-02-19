import OpenAI from "openai";
import { BaseProvider, type ProviderChatOptions, type ProviderChatResult, type ProviderMessage } from "./base";

/**
 * vLLM provider - uses OpenAI SDK since vLLM exposes an OpenAI-compatible API.
 * The apiKey parameter is used as the vLLM API key, and the modelId
 * is the HuggingFace model ID configured on the vLLM server.
 */
export class VLLMProvider extends BaseProvider {
  readonly name = "vllm_local";

  private createClient(endpointUrl: string, apiKey: string) {
    return new OpenAI({
      apiKey: apiKey || "dummy-key",
      baseURL: `${endpointUrl}/v1`,
    });
  }

  async chat(
    modelId: string,
    messages: ProviderMessage[],
    endpointUrl: string,
    options?: ProviderChatOptions,
  ): Promise<ProviderChatResult> {
    const client = this.createClient(endpointUrl, "");

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
    endpointUrl: string,
    options?: ProviderChatOptions,
  ): AsyncIterable<string> {
    const client = this.createClient(endpointUrl, "");

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
