import { relations } from "drizzle-orm";

export { users, timestamps } from "./users";
export { models, modelProviderEnum, modelStatusEnum } from "./models";
export { agents, agentTypeEnum, agentStatusEnum } from "./agents";
export {
  sessions,
  sessionAgents,
  sessionStatusEnum,
  sessionTypeEnum,
} from "./sessions";
export { messages, messageRoleEnum } from "./conversations";
export { apiKeys } from "./api-keys";
export { costRecords } from "./costs";

import { users } from "./users";
import { models } from "./models";
import { agents } from "./agents";
import { sessions, sessionAgents } from "./sessions";
import { messages } from "./conversations";
import { costRecords } from "./costs";

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  agents: many(agents),
  sessions: many(sessions),
}));

export const modelsRelations = relations(models, ({ many }) => ({
  agents: many(agents),
  messages: many(messages),
  costRecords: many(costRecords),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  model: one(models, { fields: [agents.modelId], references: [models.id] }),
  createdBy: one(users, { fields: [agents.createdById], references: [users.id] }),
  sessionAgents: many(sessionAgents),
  messages: many(messages),
  costRecords: many(costRecords),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  createdBy: one(users, { fields: [sessions.createdById], references: [users.id] }),
  sessionAgents: many(sessionAgents),
  messages: many(messages),
}));

export const sessionAgentsRelations = relations(sessionAgents, ({ one }) => ({
  session: one(sessions, { fields: [sessionAgents.sessionId], references: [sessions.id] }),
  agent: one(agents, { fields: [sessionAgents.agentId], references: [agents.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  session: one(sessions, { fields: [messages.sessionId], references: [sessions.id] }),
  agent: one(agents, { fields: [messages.agentId], references: [agents.id] }),
  model: one(models, { fields: [messages.modelId], references: [models.id] }),
}));

export const costRecordsRelations = relations(costRecords, ({ one }) => ({
  agent: one(agents, { fields: [costRecords.agentId], references: [agents.id] }),
  model: one(models, { fields: [costRecords.modelId], references: [models.id] }),
  session: one(sessions, { fields: [costRecords.sessionId], references: [sessions.id] }),
}));
