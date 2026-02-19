import { eq } from "drizzle-orm";
import type { Database } from "@repo/db";
import { sessions, sessionAgents, agents, messages, models } from "@repo/db";
import { ModelRouter } from "./router";
import type { ProviderMessage } from "./providers/base";

export interface SessionEvent {
  type: "message" | "turn_complete" | "session_complete" | "error";
  data: unknown;
}

export type SessionEventCallback = (event: SessionEvent) => void;

export class SessionManager {
  private router: ModelRouter;
  private abortControllers = new Map<string, AbortController>();

  constructor(
    private db: Database,
    encryptionKey: Buffer,
  ) {
    this.router = new ModelRouter(db, encryptionKey);
  }

  async startSession(sessionId: string, onEvent: SessionEventCallback): Promise<void> {
    const session = await this.db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Get participating agents with their models
    const participants = await this.db.query.sessionAgents.findMany({
      where: eq(sessionAgents.sessionId, sessionId),
      with: {
        agent: {
          with: { model: true },
        },
      },
      orderBy: (sa, { asc }) => [asc(sa.orderIndex)],
    });

    if (participants.length === 0) {
      throw new Error("Session has no agents");
    }

    // Update session status
    await this.db
      .update(sessions)
      .set({ status: "running", startedAt: new Date() })
      .where(eq(sessions.id, sessionId));

    const controller = new AbortController();
    this.abortControllers.set(sessionId, controller);

    try {
      await this.runTurnLoop(session, participants, onEvent, controller.signal);
    } catch (error) {
      if (controller.signal.aborted) {
        await this.db
          .update(sessions)
          .set({ status: "paused" })
          .where(eq(sessions.id, sessionId));
      } else {
        await this.db
          .update(sessions)
          .set({ status: "failed" })
          .where(eq(sessions.id, sessionId));
        onEvent({ type: "error", data: { error: String(error) } });
      }
    } finally {
      this.abortControllers.delete(sessionId);
    }
  }

  stopSession(sessionId: string): void {
    const controller = this.abortControllers.get(sessionId);
    if (controller) {
      controller.abort();
    }
  }

  private async runTurnLoop(
    session: typeof sessions.$inferSelect,
    participants: Array<{
      agent: typeof agents.$inferSelect & { model: typeof models.$inferSelect };
      role: string | null;
    }>,
    onEvent: SessionEventCallback,
    signal: AbortSignal,
  ): Promise<void> {
    const maxTurns = session.maxTurns ?? 50;
    let turnCount = session.turnCount ?? 0;

    // Load existing messages for context
    const existingMessages = await this.db.query.messages.findMany({
      where: eq(messages.sessionId, session.id),
      orderBy: (m, { asc }) => [asc(m.createdAt)],
    });

    const conversationHistory: ProviderMessage[] = existingMessages.map((m) => ({
      role: m.role as ProviderMessage["role"],
      content: m.content,
    }));

    // If this is a new session with a scenario, add it as the first user message
    if (conversationHistory.length === 0 && session.scenario) {
      const scenarioMessage: ProviderMessage = {
        role: "user",
        content: session.scenario,
      };
      conversationHistory.push(scenarioMessage);

      // Store scenario message
      await this.db.insert(messages).values({
        sessionId: session.id,
        role: "user",
        content: session.scenario,
        turnNumber: 0,
      });
    }

    while (turnCount < maxTurns) {
      if (signal.aborted) break;

      turnCount++;

      // Sequential turn-taking: each agent takes a turn
      for (const participant of participants) {
        if (signal.aborted) break;

        const { agent } = participant;

        // Build the messages for this agent
        const agentMessages: ProviderMessage[] = [
          { role: "system", content: agent.systemPrompt },
          ...conversationHistory,
        ];

        try {
          const result = await this.router.chat(agent.modelId, agentMessages, {
            temperature: parseFloat(agent.temperature ?? "0.7"),
            maxTokens: agent.maxTokens ?? 4096,
          });

          // Store the response
          const [stored] = await this.db
            .insert(messages)
            .values({
              sessionId: session.id,
              agentId: agent.id,
              modelId: agent.modelId,
              role: "assistant",
              content: result.content,
              inputTokens: result.inputTokens,
              outputTokens: result.outputTokens,
              latencyMs: result.latencyMs,
              metadata: { finishReason: result.finishReason },
              turnNumber: turnCount,
            })
            .returning();

          // Add to conversation history
          conversationHistory.push({
            role: "assistant",
            content: `[${agent.name}]: ${result.content}`,
          });

          // Emit message event
          onEvent({
            type: "message",
            data: {
              messageId: stored.id,
              agentId: agent.id,
              agentName: agent.name,
              agentType: agent.type,
              role: participant.role,
              content: result.content,
              turnNumber: turnCount,
              tokens: {
                input: result.inputTokens,
                output: result.outputTokens,
              },
              latencyMs: result.latencyMs,
            },
          });
        } catch (error) {
          onEvent({
            type: "error",
            data: {
              agentId: agent.id,
              agentName: agent.name,
              error: String(error),
              turnNumber: turnCount,
            },
          });

          // If agent config says retry on error, skip this turn
          if (!agent.config?.retryOnError) {
            throw error;
          }
        }
      }

      // Update turn count
      await this.db
        .update(sessions)
        .set({ turnCount })
        .where(eq(sessions.id, session.id));

      onEvent({
        type: "turn_complete",
        data: { turnNumber: turnCount, maxTurns },
      });
    }

    // Session complete
    await this.db
      .update(sessions)
      .set({ status: "completed", completedAt: new Date(), turnCount })
      .where(eq(sessions.id, session.id));

    onEvent({
      type: "session_complete",
      data: { totalTurns: turnCount },
    });
  }
}
