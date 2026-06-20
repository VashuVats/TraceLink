import Link from "next/link";
import { getAllLeads } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { ConfidenceBadge, Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await getAllLeads();

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <p className="label-eyebrow mb-1">Cross-Case View</p>
      <h1 className="font-display text-3xl font-bold text-paper mb-6">
        Lead Investigation
      </h1>

      <Card className="overflow-hidden">
        {leads.length === 0 ? (
          <p className="py-12 text-center text-muted">
            No leads yet. Run an OSINT scan from a case file to populate this view.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-paper-dark/60 text-left">
                <th className="px-5 py-3 label-eyebrow font-normal">Lead</th>
                <th className="px-5 py-3 label-eyebrow font-normal">Case</th>
                <th className="px-5 py-3 label-eyebrow font-normal">Source</th>
                <th className="px-5 py-3 label-eyebrow font-normal">Confidence</th>
                <th className="px-5 py-3 label-eyebrow font-normal">Location</th>
                <th className="px-5 py-3 label-eyebrow font-normal">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-paper-dark/40 last:border-0 hover:bg-paper-dark/20 align-top"
                >
                  <td className="px-5 py-3 max-w-xs text-ink-900/90">
                    {l.content.length > 110 ? `${l.content.slice(0, 110)}…` : l.content}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/case/${l.person_id}`}
                      className="font-medium text-ink-900 hover:text-tag"
                    >
                      {l.missing_persons?.name || "Unknown"}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Badge>{l.source}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <ConfidenceBadge value={l.confidence} />
                  </td>
                  <td className="px-5 py-3 text-ink-900/80">{l.location || "—"}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted">
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
