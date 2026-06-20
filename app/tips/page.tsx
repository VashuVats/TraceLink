import { getCases, getAllTips } from "@/lib/data";
import { TipForm } from "@/components/TipForm";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function TipsPage() {
  const [cases, tips] = await Promise.all([getCases(), getAllTips()]);
  const activeCases = cases.filter((c) => c.status === "active");

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <p className="label-eyebrow mb-1">Public Portal</p>
      <h1 className="font-display text-3xl font-bold text-paper mb-2">
        Submit a Citizen Tip
      </h1>
      <p className="text-sm text-paper/70 mb-6 max-w-xl">
        If you have information about an open case, share it here. Every tip
        is reviewed by the investigating team.
      </p>

      <TipForm cases={activeCases} />

      <h2 className="font-display text-xl font-bold text-paper mt-10 mb-3">
        Recent Tips
      </h2>
      <Card className="overflow-hidden">
        {tips.length === 0 ? (
          <p className="py-10 text-center text-muted">No tips submitted yet.</p>
        ) : (
          <ul className="divide-y divide-paper-dark/40">
            {tips.slice(0, 15).map((t) => (
              <li key={t.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="font-medium text-ink-900 text-sm">
                    {t.missing_persons?.name || "Unknown case"}
                  </span>
                  <Badge>{t.status}</Badge>
                </div>
                <p className="text-sm text-ink-900/80">{t.tip_text}</p>
                {t.location && (
                  <p className="text-xs text-muted mt-1">{t.location}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
