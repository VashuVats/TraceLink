import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const [cases, leads, tips, resolved] = await Promise.all([
    db.from("missing_persons").select("id", { count: "exact", head: true }),
    db.from("leads").select("id", { count: "exact", head: true }),
    db.from("citizen_tips").select("id", { count: "exact", head: true }),
    db
      .from("missing_persons")
      .select("id", { count: "exact", head: true })
      .eq("status", "resolved"),
  ]);

  return NextResponse.json({
    totalCases: cases.count ?? 0,
    openLeads: leads.count ?? 0,
    citizenTips: tips.count ?? 0,
    resolvedCases: resolved.count ?? 0,
  });
}
