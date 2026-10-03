import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";

const isValidUUID = (val: unknown): boolean =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkRateLimit(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { id } = await context.params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "ID person harus berupa format UUID yang valid" }, { status: 400 });
    }

    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Request body tidak valid" }, { status: 400 });
    }

    if (body.full_name !== undefined) {
      if (typeof body.full_name !== "string" || body.full_name.trim().length === 0 || body.full_name.trim().length > 100) {
        return NextResponse.json({ error: "full_name harus berupa string (1-100 karakter)" }, { status: 400 });
      }
    }

    if (body.gender !== undefined) {
      if (body.gender !== "male" && body.gender !== "female") {
        return NextResponse.json({ error: "gender harus bernilai 'male' atau 'female'" }, { status: 400 });
      }
    }

    if (body.birth_order !== undefined && body.birth_order !== null) {
      const num = typeof body.birth_order === "number" ? body.birth_order : Number(body.birth_order);
      if (!Number.isInteger(num) || num <= 0) {
        return NextResponse.json({ error: "birth_order harus berupa angka integer positif" }, { status: 400 });
      }
    }

    if (body.life_status !== undefined) {
      if (body.life_status !== "alive" && body.life_status !== "deceased") {
        return NextResponse.json({ error: "life_status harus bernilai 'alive' atau 'deceased'" }, { status: 400 });
      }
    }

    if (body.child_status !== undefined) {
      if (body.child_status !== "biological" && body.child_status !== "adopted" && body.child_status !== "step") {
        return NextResponse.json({ error: "child_status harus bernilai 'biological', 'adopted', atau 'step'" }, { status: 400 });
      }
    }

    if (body.father_id !== undefined && body.father_id !== null && body.father_id !== "") {
      if (!isValidUUID(body.father_id)) {
        return NextResponse.json({ error: "father_id harus berupa format UUID yang valid" }, { status: 400 });
      }
    }

    if (body.mother_id !== undefined && body.mother_id !== null && body.mother_id !== "") {
      if (!isValidUUID(body.mother_id)) {
        return NextResponse.json({ error: "mother_id harus berupa format UUID yang valid" }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.full_name !== undefined) updateData.full_name = typeof body.full_name === "string" ? body.full_name.trim() : body.full_name;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.birth_order !== undefined) updateData.birth_order = body.birth_order !== null ? Number(body.birth_order) : null;
    if (body.life_status !== undefined) updateData.life_status = body.life_status;
    if (body.child_status !== undefined) updateData.child_status = body.child_status;
    if (body.father_id !== undefined) updateData.father_id = body.father_id || null;
    if (body.mother_id !== undefined) updateData.mother_id = body.mother_id || null;

    const { data, error } = await supabaseServer
      .from("persons")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkRateLimit(request)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { id } = await context.params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "ID person harus berupa format UUID yang valid" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("persons")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
