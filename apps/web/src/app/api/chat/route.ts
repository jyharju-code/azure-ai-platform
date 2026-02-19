import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ModelRouter } from "@repo/ai-core";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { modelId, messages, temperature, maxTokens } = body;

    const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
    const router = new ModelRouter(db, encryptionKey);

    const result = await router.chat(modelId, messages, { temperature, maxTokens });

    return NextResponse.json({
      content: result.content,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      finishReason: result.finishReason,
      latencyMs: result.latencyMs,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 },
    );
  }
}
