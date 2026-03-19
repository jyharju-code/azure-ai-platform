import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiKeys } from "@repo/db";
import { encrypt } from "@/lib/encryption";

export async function GET() {
  try {
    const keys = await db.query.apiKeys.findMany({
      columns: {
        id: true,
        name: true,
        provider: true,
        keyPrefix: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: (k: any, { desc }: any) => [desc(k.createdAt)],
    });
    return NextResponse.json(keys);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, provider, key } = body;

    const encrypted = encrypt(key);
    const keyPrefix = key.substring(0, 8);

    const [apiKey] = await db
      .insert(apiKeys)
      .values({
        name,
        provider,
        encryptedKey: encrypted.encrypted,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        keyPrefix,
      })
      .returning({
        id: apiKeys.id,
        name: apiKeys.name,
        provider: apiKeys.provider,
        keyPrefix: apiKeys.keyPrefix,
        createdAt: apiKeys.createdAt,
      });

    return NextResponse.json(apiKey, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}
