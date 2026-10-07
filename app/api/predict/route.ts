import { NextResponse } from "next/server";
import { predictDemand } from "@/lib/predict";
import type { PredictionInput } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as PredictionInput;
  if (!body.routeId || !body.stopId || !body.date || !body.time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  return NextResponse.json(predictDemand(body));
}
