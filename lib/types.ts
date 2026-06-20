export type CaseStatus = "active" | "resolved";

export interface MissingPerson {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  photo_url: string | null;
  description: string | null;
  last_seen_location: string | null;
  last_seen_lat: number | null;
  last_seen_lng: number | null;
  last_seen_date: string | null;
  status: CaseStatus;
  created_at: string;
}

export type LeadSourceType = "news" | "social" | "citizen_tip";

export interface Lead {
  id: string;
  person_id: string;
  source: string; // e.g. "Google News", "X (sample)", "Reddit (sample)"
  source_type: LeadSourceType;
  source_url: string | null;
  content: string;
  location: string | null;
  lat: number | null;
  lng: number | null;
  confidence: number; // 0-100, from AI scoring
  image_url: string | null;
  created_at: string;
}

export interface CitizenTip {
  id: string;
  person_id: string;
  tip_text: string;
  location: string | null;
  lat: number | null;
  lng: number | null;
  contact_info: string | null;
  status: "new" | "reviewed" | "dismissed";
  created_at: string;
}

export interface DashboardStats {
  totalCases: number;
  openLeads: number;
  citizenTips: number;
  resolvedCases: number;
}
