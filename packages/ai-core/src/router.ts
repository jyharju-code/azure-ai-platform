import { eq } from "drizzle-orm";
import type { Database } from "@repo/db";
import { models, apiKeys } from "@repo/db";
import type { ProviderChatOptions, ProviderChatResult, ProviderMessage } from "./providers/base";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { VLLMProvider } from "./providers/vllm";
import { decryptApiKey } from "./encryption";

export class ModelRouter {
  private openai = new OpenAIProvider();
  private anthropic = new AnthropicProvider();
  private vllm = new VLLMProvider();

  constructor(
    private db: Database,
    private encryptionKey: Buffer,
  ) {}

  async chat(
    modelId: string,
    messages: ProviderMessage[],
    options?: ProviderChatOptions,
  ): Promise<ProviderChatResult & { latencyMs: number }> {
    const model = await this.db.query.models.findFirst({
      where: eq(models.id, modelId),
    });

    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const start = Date.now();
    let result: ProviderChatResult;

    switch (model.provider) {
      case "openai": {
        const key = await this.getDecryptedApiKey("openai");
        result = await this.openai.chat(model.providerModelId, messages, key, options);
        break;
      }
      case "anthropic": {
        const key = await this.getDecryptedApiKey("anthropic");
        result = await this.anthropic.chat(model.providerModelId, messages, key, options);
        break;
      }
      case "vllm_local": {
        if (!model.endpointUrl) {
          throw new Error(`Model ${model.name} has no endpoint URL. Is it deployed?`);
        }
        result = await this.vllm.chat(model.providerModelId, messages, model.endpointUrl, options);
        break;
      }
      case "ollama_local": {
        // Ollama also uses OpenAI-compatible API
        const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
        result = await this.vllm.chat(model.providerModelId, messages, ollamaUrl, options);
        break;
      }
      default:
        throw new Error(`Unsupported provider: ${model.provider}`);
    }

    return {
      ...result,
      latencyMs: Date.now() - start,
    };
  }

  async chatStream(
    modelId: string,
    messages: ProviderMessage[],
    options?: ProviderChatOptions,
  ): Promise<AsyncIterable<string>> {
    const model = await this.db.query.models.findFirst({
      where: eq(models.id, modelId),
    });

    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    switch (model.provider) {
      case "openai": {
        const key = await this.getDecryptedApiKey("openai");
        return this.openai.chatStream(model.providerModelId, messages, key, options);
      }
      case "anthropic": {
        const key = await this.getDecryptedApiKey("anthropic");
        return this.anthropic.chatStream(model.providerModelId, messages, key, options);
      }
      case "vllm_local": {
        if (!model.endpointUrl) {
          throw new Error(`Model ${model.name} has no endpoint URL.`);
        }
        return this.vllm.chatStream(model.providerModelId, messages, model.endpointUrl, options);
      }
      case "ollama_local": {
        const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
        return this.vllm.chatStream(model.providerModelId, messages, ollamaUrl, options);
      }
      default:
        throw new Error(`Unsupported provider: ${model.provider}`);
    }
  }

  private async getDecryptedApiKey(provider: "openai" | "anthropic"): Promise<string> {
    const key = await this.db.query.apiKeys.findFirst({
      where: eq(apiKeys.provider, provider),
    });

    if (!key) {
      throw new Error(`No API key found for provider: ${provider}`);
    }

    return decryptApiKey(
      { encrypted: key.encryptedKey, iv: key.iv, authTag: key.authTag },
      this.encryptionKey,
    );
  }
}
