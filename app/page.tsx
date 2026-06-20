import Link from "next/link";
import { FolderOpen, Radar, MessageSquareWarning, CheckCircle2, Plus } from "lucide-react";
import { getStats, getCases } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusStamp } from "@/components/ui/Badge";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, cases] = await Promise.all([getStats(), getCases()]);

  const statCards = [
    { label: "Total Cases", value: stats.totalCases, icon: FolderOpen },
    { label: "Open Leads", value: stats.openLeads, icon: Radar },
    { label: "Citizen Tips", value: stats.citizenTips, icon: MessageSquareWarning },
    { label: "Resolved Cases", value: stats.resolvedCases, icon: CheckCircle2 },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <header className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="label-eyebrow mb-1">Investigation Dashboard</p>
          <h1 className="font-display text-3xl font-bold text-paper">
            Active Caseload
          </h1>
        </div>
        <Link href="/case/new">
          <Button>
            <Plus className="h-4 w-4" /> New Case
          </Button>
        </Link>
      </header>

      {!isSupabaseConfigured && <ConfigWarning />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-start justify-between">
              <div>
                <p className="label-eyebrow mb-2">{label}</p>
                <p className="font-display text-3xl font-bold text-ink-900">
                  {value}
                </p>
              </div>
              <Icon className="h-5 w-5 text-tag mt-1" strokeWidth={2} />
            </CardContent>
          </Card>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold text-paper">
            Recent Activity
          </h2>
          <span className="label-eyebrow">{cases.length} case(s) on file</span>
        </div>
        <Card className="overflow-hidden">
          {cases.length === 0 ? (
            <CardContent className="py-12 text-center text-muted">
              No cases yet. Create one to start an investigation.
            </CardContent>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paper-dark/60 text-left">
                  <th className="px-5 py-3 label-eyebrow font-normal">Name</th>
                  <th className="px-5 py-3 label-eyebrow font-normal">Last Seen</th>
                  <th className="px-5 py-3 label-eyebrow font-normal">Date</th>
                  <th className="px-5 py-3 label-eyebrow font-normal">Status</th>
                  <th className="px-5 py-3 label-eyebrow font-normal">Filed</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-paper-dark/40 last:border-0 hover:bg-paper-dark/20"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/case/${c.id}`}
                        className="font-medium text-ink-900 hover:text-tag"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink-900/80">
                      {c.last_seen_location || "—"}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-900/70">
                      {c.last_seen_date || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusStamp status={c.status} />
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </section>
    </div>
  );
}

function ConfigWarning() {
  return (
    <div className="mb-8 rounded border border-tag/50 bg-tag/10 px-4 py-3 text-sm text-tag-light">
      Supabase isn&apos;t configured yet — set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and
      keys in <code className="font-mono">.env.local</code> (see README) to load real data.
    </div>
  );
}
