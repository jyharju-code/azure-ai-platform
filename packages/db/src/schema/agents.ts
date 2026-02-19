import { pgTable, text, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { timestamps, users } from "./users";
import { models } from "./models";

export const agentTypeEnum = pgEnum("agent_type", [
  "red_team",
  "blue_team",
  "general",
  "custom",
]);

export const agentStatusEnum = pgEnum("agent_status", [
  "idle",
  "running",
  "paused",
  "error",
  "stopped",
]);

export const agents = pgTable("agents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  type: agentTypeEnum("type").notNull(),
  status: agentStatusEnum("status").default("idle").notNull(),
  modelId: text("model_id")
    .notNull()
    .references(() => models.id),
  createdById: text("created_by_id").references(() => users.id),
  systemPrompt: text("system_prompt").notNull(),
  temperature: text("temperature").default("0.7"),
  maxTokens: integer("max_tokens").default(4096),
  tools: jsonb("tools")
    .$type<
      Array<{
        name: string;
        description: string;
        parameters: Record<string, unknown>;
      }>
    >()
    .default([]),
  config: jsonb("config").$type<{
    autoReply?: boolean;
    maxTurns?: number;
    stopSequences?: string[];
    responseFormat?: "text" | "json";
    retryOnError?: boolean;
    fallbackModelId?: string;
  }>(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});
