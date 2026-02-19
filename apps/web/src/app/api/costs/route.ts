import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { costRecords } from "@repo/db";
import { gte, lte, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const conditions = [];
    if (from) conditions.push(gte(costRecords.periodStart, new Date(from)));
    if (to) conditions.push(lte(costRecords.periodEnd, new Date(to)));

    const records = await db
      .select()
      .from(costRecords)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(costRecords.createdAt);

    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch costs" }, { status: 500 });
  }
}
