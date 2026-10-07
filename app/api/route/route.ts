import { NextResponse } from "next/server";
import { planRoute } from "@/lib/routing";

export async function POST(request: Request) {
  const body = (await request.json()) as { startId?: string; endId?: string };
  if (!body.startId || !body.endId) {
    return NextResponse.json({ error: "Missing start or destination stop" }, { status: 400 });
  }
  return NextResponse.json(planRoute(body.startId, body.endId));
}
