import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@repo/db";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, id),
      with: { model: true },
    });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    return NextResponse.json(agent);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch agent" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const [updated] = await db.update(agents).set({ ...body, updatedAt: new Date() }).where(eq(agents.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await db.update(agents).set({ isActive: false }).where(eq(agents.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 });
  }
}
