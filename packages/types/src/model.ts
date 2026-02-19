export type ModelProvider = "openai" | "anthropic" | "vllm_local" | "ollama_local";
export type ModelStatus = "available" | "deploying" | "running" | "stopped" | "failed" | "not_deployed";

export interface ModelConfig {
  maxModelLen?: number;
  gpuMemoryUtilization?: number;
  quantization?: string;
  tensorParallelSize?: number;
}

export interface CreateModelInput {
  name: string;
  slug: string;
  provider: ModelProvider;
  providerModelId: string;
  isCommercial?: boolean;
  contextWindow?: number;
  costPerInputToken?: string;
  costPerOutputToken?: string;
  gpuType?: string;
  config?: ModelConfig;
}
