import { getCases, getAllLeads, getAllTips } from "@/lib/data";
import { MapLoader, type MapPin } from "@/components/MapLoader";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function MapIntelPage() {
  const [cases, leads, tips] = await Promise.all([
    getCases(),
    getAllLeads(),
    getAllTips(),
  ]);

  const pins: MapPin[] = [];
  for (const c of cases) {
    if (c.last_seen_lat && c.last_seen_lng) {
      pins.push({
        id: `case-${c.id}`,
        lat: c.last_seen_lat,
        lng: c.last_seen_lng,
        label: `${c.name} — last seen`,
        detail: c.last_seen_location || undefined,
        kind: "last_seen",
      });
    }
  }
  for (const l of leads) {
    if (l.lat && l.lng) {
      pins.push({
        id: `lead-${l.id}`,
        lat: l.lat,
        lng: l.lng,
        label: `${l.missing_persons?.name || "Lead"} — ${l.source}`,
        detail: l.content.slice(0, 90),
        kind: "lead",
      });
    }
  }
  for (const t of tips) {
    if (t.lat && t.lng) {
      pins.push({
        id: `tip-${t.id}`,
        lat: t.lat,
        lng: t.lng,
        label: `${t.missing_persons?.name || "Tip"} — citizen tip`,
        detail: t.tip_text.slice(0, 90),
        kind: "tip",
      });
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <p className="label-eyebrow mb-1">All Active Cases</p>
      <h1 className="font-display text-3xl font-bold text-paper mb-6">
        Map Intelligence
      </h1>

      <Card>
        <CardContent className="p-0">
          <MapLoader pins={pins} height={560} zoom={5} />
        </CardContent>
      </Card>

      <div className="flex gap-6 mt-4 text-sm text-paper/80">
        <Legend color="#C23B3B" label="Last seen" />
        <Legend color="#E2A0A0" label="OSINT lead" />
        <Legend color="#5C8A6B" label="Citizen tip" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-full inline-block border border-paper"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
