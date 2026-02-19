import { pgTable, text, integer, jsonb, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { sessions } from "./sessions";
import { agents } from "./agents";
import { models } from "./models";

export const messageRoleEnum = pgEnum("message_role", [
  "system",
  "user",
  "assistant",
  "tool",
]);

export const messages = pgTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  agentId: text("agent_id").references(() => agents.id),
  modelId: text("model_id").references(() => models.id),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  latencyMs: integer("latency_ms"),
  metadata: jsonb("metadata").$type<{
    toolCalls?: Array<{ name: string; arguments: string; result: string }>;
    finishReason?: string;
    modelVersion?: string;
  }>(),
  turnNumber: integer("turn_number"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
