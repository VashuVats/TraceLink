import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const { data, error } = await db
    .from("citizen_tips")
    .select("*, missing_persons(name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tips: data });
}

export async function POST(req: NextRequest) {
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await req.json();
  const { person_id, tip_text, location, contact_info } = body;

  if (!person_id || !tip_text) {
    return NextResponse.json(
      { error: "person_id and tip_text are required" },
      { status: 400 }
    );
  }

  const { data, error } = await db
    .from("citizen_tips")
    .insert({
      person_id,
      tip_text,
      location: location ?? null,
      contact_info: contact_info ?? null,
      status: "new",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tip: data }, { status: 201 });
}
