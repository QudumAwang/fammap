import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";

const isValidUUID = (val: unknown): boolean =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
type PositionPayload = { person_id: unknown; x: unknown; y: unknown };

export async function GET() {
  const { data, error } = await supabaseServer
    .from("person_positions")
    .select("person_id, x, y");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  if (!checkRateLimit(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();

    const positions: PositionPayload[] = Array.isArray(body?.positions) ? body.positions : [body];
    if (
      !body ||
      typeof body !== "object" ||
      positions.length === 0 ||
      positions.length > 500 ||
      positions.some(
        (position) =>
          !isValidUUID(position?.person_id) ||
          typeof position.x !== "number" ||
          typeof position.y !== "number" ||
          !Number.isFinite(position.x) ||
          !Number.isFinite(position.y)
      )
    ) {
      return NextResponse.json({ error: "Data posisi tidak valid" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("person_positions")
      .upsert(
        positions.map((position) => ({
          person_id: position.person_id,
          x: position.x,
          y: position.y,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "person_id" }
      )
      .select("person_id, x, y");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
