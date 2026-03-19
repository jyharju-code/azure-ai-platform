const MEGASEARCH_URL = process.env.MEGASEARCH_URL || "http://135.225.90.224:8899";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return Response.json({ error: "query required" }, { status: 400 });
    }

    // Proxy to MegaSearch FastAPI SSE endpoint
    const upstream = await fetch(`${MEGASEARCH_URL}/search/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return Response.json({ error: `MegaSearch error: ${err}` }, { status: upstream.status });
    }

    // Stream SSE response through
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("MegaSearch API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
