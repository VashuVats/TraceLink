"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Radar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ScanButton({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function runScan() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/scan`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      const queryCount = Array.isArray(data.queries) ? data.queries.length : 0;
      setResult(
        data.leadsCreated > 0
          ? `${data.leadsCreated} news lead(s) from ${queryCount} search(es).`
          : `No news matches yet (${queryCount} search${queryCount === 1 ? "" : "es"} run). Try adding city/region to last-seen location.`
      );
      router.refresh();
    } catch (err: any) {
      setResult(err.message || "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={runScan} disabled={loading} variant="primary">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Radar className="h-4 w-4" />
        )}
        {loading ? "Scanning…" : "Run OSINT Scan"}
      </Button>
      {result && <p className="text-xs text-paper/70 max-w-[220px] text-right">{result}</p>}
    </div>
  );
}
