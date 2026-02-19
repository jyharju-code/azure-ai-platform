import { pgTable, text, integer, jsonb, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { timestamps, users } from "./users";
import { agents } from "./agents";

export const sessionStatusEnum = pgEnum("session_status", [
  "pending",
  "running",
  "paused",
  "completed",
  "failed",
]);

export const sessionTypeEnum = pgEnum("session_type", [
  "red_vs_blue",
  "multi_agent",
  "single_agent",
]);

export const sessions = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  type: sessionTypeEnum("type").notNull(),
  status: sessionStatusEnum("status").default("pending").notNull(),
  createdById: text("created_by_id").references(() => users.id),
  maxTurns: integer("max_turns").default(50),
  turnCount: integer("turn_count").default(0),
  scenario: text("scenario"),
  config: jsonb("config").$type<{
    turnOrder?: "sequential" | "parallel";
    mediatorPrompt?: string;
    evaluationCriteria?: string[];
  }>(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps,
});

export const sessionAgents = pgTable("session_agents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  agentId: text("agent_id")
    .notNull()
    .references(() => agents.id),
  role: text("role"),
  orderIndex: integer("order_index").default(0),
});
