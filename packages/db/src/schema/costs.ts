import { pgTable, text, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { agents } from "./agents";
import { models } from "./models";
import { sessions } from "./sessions";

export const costRecords = pgTable("cost_records", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  agentId: text("agent_id").references(() => agents.id),
  modelId: text("model_id")
    .notNull()
    .references(() => models.id),
  sessionId: text("session_id").references(() => sessions.id),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  totalCostUsd: numeric("total_cost_usd", { precision: 12, scale: 8 }).notNull(),
  gpuSecondsUsed: integer("gpu_seconds_used"),
  gpuCostUsd: numeric("gpu_cost_usd", { precision: 12, scale: 8 }),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
