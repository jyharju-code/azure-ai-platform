import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, sessionAgents } from "@repo/db";

export async function GET() {
  try {
    const allSessions = await db.query.sessions.findMany({
      with: { sessionAgents: { with: { agent: true } } },
      orderBy: (s: any, { desc }: any) => [desc(s.createdAt)],
    });
    return NextResponse.json(allSessions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [session] = await db
      .insert(sessions)
      .values({
        name: body.name,
        type: body.type,
        scenario: body.scenario,
        maxTurns: body.maxTurns ?? 50,
        config: body.config,
      })
      .returning();

    if (body.agentIds?.length > 0) {
      await db.insert(sessionAgents).values(
        body.agentIds.map((a: { agentId: string; role?: string }, index: number) => ({
          sessionId: session.id,
          agentId: a.agentId,
          role: a.role,
          orderIndex: index,
        })),
      );
    }

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
