import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const { data, error } = await db
    .from("missing_persons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cases: data });
}

export async function POST(req: NextRequest) {
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await req.json();
  const { name, age, gender, photo_url, description, last_seen_location, last_seen_lat, last_seen_lng, last_seen_date } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const { data, error } = await db
    .from("missing_persons")
    .insert({
      name,
      age: age ?? null,
      gender: gender ?? null,
      photo_url: photo_url ?? null,
      description: description ?? null,
      last_seen_location: last_seen_location ?? null,
      last_seen_lat: last_seen_lat ?? null,
      last_seen_lng: last_seen_lng ?? null,
      last_seen_date: last_seen_date ?? null,
      status: "active",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ case: data }, { status: 201 });
}
