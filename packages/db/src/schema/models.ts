import { pgTable, text, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { timestamps } from "./users";

export const modelProviderEnum = pgEnum("model_provider", [
  "openai",
  "anthropic",
  "vllm_local",
  "ollama_local",
]);

export const modelStatusEnum = pgEnum("model_status", [
  "available",
  "deploying",
  "running",
  "stopped",
  "failed",
  "not_deployed",
]);

export const models = pgTable("models", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  provider: modelProviderEnum("provider").notNull(),
  providerModelId: text("provider_model_id").notNull(),
  status: modelStatusEnum("status").default("not_deployed").notNull(),
  isCommercial: boolean("is_commercial").default(false).notNull(),
  containerAppId: text("container_app_id"),
  endpointUrl: text("endpoint_url"),
  contextWindow: integer("context_window"),
  costPerInputToken: text("cost_per_input_token"),
  costPerOutputToken: text("cost_per_output_token"),
  gpuType: text("gpu_type"),
  config: jsonb("config").$type<{
    maxModelLen?: number;
    gpuMemoryUtilization?: number;
    quantization?: string;
    tensorParallelSize?: number;
  }>(),
  ...timestamps,
});
