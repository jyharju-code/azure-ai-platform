import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { models } from "@repo/db";

export async function GET() {
  try {
    const allModels = await db.query.models.findMany({
      orderBy: (m: any, { asc }: any) => [asc(m.name)],
    });
    return NextResponse.json(allModels);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [model] = await db
      .insert(models)
      .values({
        name: body.name,
        slug: body.slug,
        provider: body.provider,
        providerModelId: body.providerModelId,
        isCommercial: body.isCommercial ?? false,
        contextWindow: body.contextWindow,
        costPerInputToken: body.costPerInputToken,
        costPerOutputToken: body.costPerOutputToken,
        gpuType: body.gpuType,
        config: body.config,
      })
      .returning();
    return NextResponse.json(model, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create model" }, { status: 500 });
  }
}
