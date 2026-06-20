import { notFound } from "next/navigation";
import { getCase } from "@/lib/data";
import { summarizeProfile } from "@/lib/ai_service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusStamp, ConfidenceBadge, Badge } from "@/components/ui/Badge";
import { ScanButton } from "@/components/ScanButton";
import { BulletinButton } from "@/components/BulletinButton";
import { MapLoader, type MapPin } from "@/components/MapLoader";
import { User, MapPin as MapPinIcon, Calendar, Newspaper, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCase(id);
  if (!data) notFound();
  const { person, leads, tips } = data;

  const summary = person.description
    ? await summarizeProfile(person.description)
    : null;

  const pins: MapPin[] = [];
  if (person.last_seen_lat && person.last_seen_lng) {
    pins.push({
      id: "last-seen",
      lat: person.last_seen_lat,
      lng: person.last_seen_lng,
      label: "Last seen",
      detail: person.last_seen_location || undefined,
      kind: "last_seen",
    });
  }
  for (const l of leads) {
    if (l.lat && l.lng) {
      pins.push({
        id: l.id,
        lat: l.lat,
        lng: l.lng,
        label: `${l.source} (${l.confidence}%)`,
        detail: l.content.slice(0, 80),
        kind: "lead",
      });
    }
  }
  for (const t of tips) {
    if (t.lat && t.lng) {
      pins.push({
        id: t.id,
        lat: t.lat,
        lng: t.lng,
        label: "Citizen tip",
        detail: t.tip_text.slice(0, 80),
        kind: "tip",
      });
    }
  }

  const timeline = [
    person.last_seen_date && {
      date: person.last_seen_date,
      label: "Last seen",
      detail: person.last_seen_location,
    },
    {
      date: person.created_at,
      label: "Case filed",
      detail: "Record created in TraceLink",
    },
    ...leads.map((l) => ({
      date: l.created_at,
      label: `Lead — ${l.source}`,
      detail: l.content.slice(0, 100),
    })),
    ...tips.map((t) => ({
      date: t.created_at,
      label: "Citizen tip submitted",
      detail: t.tip_text.slice(0, 100),
    })),
  ]
    .filter(Boolean)
    .sort(
      (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ) as { date: string; label: string; detail: string | null }[];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="label-eyebrow mb-1">Case File</p>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-paper">
              {person.name}
            </h1>
            <StatusStamp status={person.status} />
          </div>
        </div>
        <div className="flex gap-3">
          <ScanButton caseId={person.id} />
          <BulletinButton caseId={person.id} name={person.name} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: photo + description */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="aspect-square bg-ink-700 flex items-center justify-center overflow-hidden rounded-t">
              {person.photo_url ? (
                <img
                  src={person.photo_url}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-ink-500" />
              )}
            </div>
            <CardContent className="space-y-2 text-sm">
              <Row icon={User} label={[person.age ? `${person.age} yrs` : null, person.gender].filter(Boolean).join(" · ") || "Demographics unknown"} />
              <Row icon={MapPinIcon} label={person.last_seen_location || "Location unknown"} />
              <Row icon={Calendar} label={person.last_seen_date || "Date unknown"} />
            </CardContent>
          </Card>

          {summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Investigation Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-ink-900/90 leading-relaxed">
                {summary}
              </CardContent>
            </Card>
          )}

          {person.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Full Description</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-ink-900/80 leading-relaxed whitespace-pre-wrap">
                {person.description}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: map, OSINT, timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Map</CardTitle>
            </CardHeader>
            <CardContent>
              <MapLoader
                pins={pins}
                center={
                  person.last_seen_lat && person.last_seen_lng
                    ? [person.last_seen_lat, person.last_seen_lng]
                    : undefined
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">OSINT Results ({leads.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leads.length === 0 ? (
                <p className="text-sm text-muted">
                  No leads yet. Run an OSINT scan to search Google News with
                  AI-generated queries from this case.
                </p>
              ) : (
                leads.map((l) => (
                  <div
                    key={l.id}
                    className="border border-paper-dark/60 rounded p-3 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {l.source_type === "news" ? (
                          <Newspaper className="h-3.5 w-3.5 text-muted" />
                        ) : (
                          <MessageCircle className="h-3.5 w-3.5 text-muted" />
                        )}
                        <Badge>{l.source}</Badge>
                      </div>
                      <ConfidenceBadge value={l.confidence} />
                    </div>
                    <p className="text-sm text-ink-900/85">{l.content}</p>
                    {l.source_url && (
                      <a
                        href={l.source_url}
                        target="_blank"
                        className="text-xs text-tag hover:underline"
                      >
                        View source →
                      </a>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {timeline.map((t, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <span className="h-2 w-2 rounded-full bg-tag" />
                      {i < timeline.length - 1 && (
                        <span className="w-px flex-1 bg-paper-dark/60 mt-1" />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className="font-mono text-[11px] text-muted">
                        {new Date(t.date).toLocaleString()}
                      </p>
                      <p className="text-sm font-medium text-ink-900">{t.label}</p>
                      {t.detail && (
                        <p className="text-sm text-ink-900/70">{t.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 text-ink-900/80">
      <Icon className="h-3.5 w-3.5 text-muted shrink-0" />
      <span>{label}</span>
    </div>
  );
}
