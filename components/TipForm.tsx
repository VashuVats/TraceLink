"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label, Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import type { MissingPerson } from "@/lib/types";

export function TipForm({ cases }: { cases: MissingPerson[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    person_id: cases[0]?.id || "",
    tip_text: "",
    location: "",
    contact_info: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit tip");
      setDone(true);
      setForm((f) => ({ ...f, tip_text: "", location: "", contact_info: "" }));
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="text-sm text-muted">
          No active cases to report a tip on yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="grid gap-5">
          <div>
            <Label htmlFor="person_id">Which case is this about? *</Label>
            <Select
              id="person_id"
              required
              value={form.person_id}
              onChange={(e) => update("person_id", e.target.value)}
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="tip_text">What did you see? *</Label>
            <Textarea
              id="tip_text"
              required
              value={form.tip_text}
              onChange={(e) => update("tip_text", e.target.value)}
              placeholder="Describe what you saw, when, and any identifying details…"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="Near 5th & Main St"
              />
            </div>
            <div>
              <Label htmlFor="contact_info">Your Contact Info (optional)</Label>
              <Input
                id="contact_info"
                value={form.contact_info}
                onChange={(e) => update("contact_info", e.target.value)}
                placeholder="Phone or email, if you're open to follow-up"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-tag border border-tag/40 bg-tag/10 rounded px-3 py-2">
              {error}
            </p>
          )}
          {done && (
            <p className="text-sm text-resolved border border-resolved/40 bg-resolved/10 rounded px-3 py-2">
              Tip submitted. Thank you — investigators will review it.
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Tip"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
