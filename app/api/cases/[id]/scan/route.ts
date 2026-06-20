import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { searchNewsMulti } from "@/lib/osint_service";
import { generateSearchQueries, scoreLead } from "@/lib/ai_service";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const { id } = await params;
  const { data: person, error: personErr } = await db
    .from("missing_persons")
    .select("*")
    .eq("id", id)
    .single();

  if (personErr || !person) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const caseInput = {
    name: person.name,
    age: person.age,
    gender: person.gender,
    description: person.description,
    last_seen_location: person.last_seen_location,
    last_seen_date: person.last_seen_date,
  };

  const caseDetails = [
    `Name: ${person.name}`,
    person.age ? `Age: ${person.age}` : null,
    person.gender ? `Gender: ${person.gender}` : null,
    person.description ? `Description: ${person.description}` : null,
    person.last_seen_location
      ? `Last seen location: ${person.last_seen_location}`
      : null,
    person.last_seen_date ? `Last seen date: ${person.last_seen_date}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const queries = await generateSearchQueries(caseInput);
  const newsResults = await searchNewsMulti(queries);

  const newLeads = [];

  for (const n of newsResults) {
    const leadText = `${n.title}\n${n.summary}`;
    const confidence = await scoreLead(leadText, caseDetails);
    newLeads.push({
      person_id: person.id,
      source: n.source || "Google News",
      source_type: "news" as const,
      source_url: n.url || null,
      content: `${n.title} — ${n.summary}`,
      location: person.last_seen_location ?? null,
      lat: person.last_seen_lat ?? null,
      lng: person.last_seen_lng ?? null,
      confidence,
      image_url: null,
    });
  }

  if (newLeads.length > 0) {
    const { error: insertErr } = await db.from("leads").insert(newLeads);
    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    queries,
    scanned: { news: newsResults.length },
    leadsCreated: newLeads.length,
  });
}
