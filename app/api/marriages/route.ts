import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";

const isValidUUID = (val: unknown): boolean =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export async function GET() {
  const { data, error } = await supabaseServer
    .from("marriages")
    .select("*")
    .order("marriage_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!checkRateLimit(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Request body tidak valid" }, { status: 400 });
    }

    if (!body.husband_id || !isValidUUID(body.husband_id)) {
      return NextResponse.json({ error: "husband_id wajib diisi format UUID yang valid" }, { status: 400 });
    }

    if (!body.wife_id || !isValidUUID(body.wife_id)) {
      return NextResponse.json({ error: "wife_id wajib diisi format UUID yang valid" }, { status: 400 });
    }

    if (body.marriage_order !== undefined && body.marriage_order !== null) {
      const num = typeof body.marriage_order === "number" ? body.marriage_order : Number(body.marriage_order);
      if (!Number.isInteger(num) || num <= 0) {
        return NextResponse.json({ error: "marriage_order harus berupa angka integer positif" }, { status: 400 });
      }
    }

    if (body.status !== "married" && body.status !== "divorced" && body.status !== "widowed") {
      return NextResponse.json({ error: "status harus bernilai 'married', 'divorced', atau 'widowed'" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("marriages")
      .insert({
        husband_id: body.husband_id,
        wife_id: body.wife_id,
        marriage_order: body.marriage_order ? Number(body.marriage_order) : 1,
        status: body.status,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
