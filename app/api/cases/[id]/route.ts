import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const { id } = await params;
  const [{ data: person, error: personErr }, { data: leads }, { data: tips }] =
    await Promise.all([
      db.from("missing_persons").select("*").eq("id", id).single(),
      db
        .from("leads")
        .select("*")
        .eq("person_id", id)
        .order("confidence", { ascending: false }),
      db
        .from("citizen_tips")
        .select("*")
        .eq("person_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (personErr || !person) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json({ case: person, leads: leads ?? [], tips: tips ?? [] });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const { id } = await params;
  const body = await req.json();
  const { data, error } = await db
    .from("missing_persons")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ case: data });
}
