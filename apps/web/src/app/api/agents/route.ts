import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@repo/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allAgents = await db.query.agents.findMany({
      where: eq(agents.isActive, true),
      with: { model: true },
      orderBy: (a, { desc }) => [desc(a.createdAt)],
    });
    return NextResponse.json(allAgents);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [agent] = await db
      .insert(agents)
      .values({
        name: body.name,
        description: body.description,
        type: body.type,
        modelId: body.modelId,
        systemPrompt: body.systemPrompt,
        temperature: body.temperature ?? "0.7",
        maxTokens: body.maxTokens ?? 4096,
        tools: body.tools ?? [],
        config: body.config,
      })
      .returning();
    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}
