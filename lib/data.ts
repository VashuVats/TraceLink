import { supabaseAdmin } from "@/lib/supabase";
import type { MissingPerson, Lead, CitizenTip, DashboardStats } from "@/lib/types";

export async function getStats(): Promise<DashboardStats> {
  const db = supabaseAdmin();
  if (!db) return { totalCases: 0, openLeads: 0, citizenTips: 0, resolvedCases: 0 };

  const [cases, leads, tips, resolved] = await Promise.all([
    db.from("missing_persons").select("id", { count: "exact", head: true }),
    db.from("leads").select("id", { count: "exact", head: true }),
    db.from("citizen_tips").select("id", { count: "exact", head: true }),
    db
      .from("missing_persons")
      .select("id", { count: "exact", head: true })
      .eq("status", "resolved"),
  ]);

  return {
    totalCases: cases.count ?? 0,
    openLeads: leads.count ?? 0,
    citizenTips: tips.count ?? 0,
    resolvedCases: resolved.count ?? 0,
  };
}

export async function getCases(): Promise<MissingPerson[]> {
  const db = supabaseAdmin();
  if (!db) return [];
  const { data } = await db
    .from("missing_persons")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getCase(id: string) {
  const db = supabaseAdmin();
  if (!db) return null;
  const [{ data: person }, { data: leads }, { data: tips }] = await Promise.all([
    db.from("missing_persons").select("*").eq("id", id).single(),
    db.from("leads").select("*").eq("person_id", id).order("confidence", { ascending: false }),
    db.from("citizen_tips").select("*").eq("person_id", id).order("created_at", { ascending: false }),
  ]);
  if (!person) return null;
  return {
    person: person as MissingPerson,
    leads: (leads ?? []) as Lead[],
    tips: (tips ?? []) as CitizenTip[],
  };
}

export async function getAllLeads(): Promise<(Lead & { missing_persons: { name: string } | null })[]> {
  const db = supabaseAdmin();
  if (!db) return [];
  const { data } = await db
    .from("leads")
    .select("*, missing_persons(name)")
    .order("confidence", { ascending: false });
  return (data ?? []) as any;
}

export async function getAllTips(): Promise<(CitizenTip & { missing_persons: { name: string } | null })[]> {
  const db = supabaseAdmin();
  if (!db) return [];
  const { data } = await db
    .from("citizen_tips")
    .select("*, missing_persons(name)")
    .order("created_at", { ascending: false });
  return (data ?? []) as any;
}

export async function getActiveCasesForMap(): Promise<MissingPerson[]> {
  const db = supabaseAdmin();
  if (!db) return [];
  const { data } = await db
    .from("missing_persons")
    .select("*")
    .not("last_seen_lat", "is", null);
  return (data ?? []) as MissingPerson[];
}
