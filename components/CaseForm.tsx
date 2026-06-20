"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label, Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export function CaseForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    photo_url: "",
    description: "",
    last_seen_location: "",
    last_seen_lat: "",
    last_seen_lng: "",
    last_seen_date: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: form.age ? Number(form.age) : null,
          last_seen_lat: form.last_seen_lat ? Number(form.last_seen_lat) : null,
          last_seen_lng: form.last_seen_lng ? Number(form.last_seen_lng) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create case");
      router.push(`/case/${data.case.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="grid gap-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Jordan Avery Smith"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={0}
                  value={form.age}
                  onChange={(e) => update("age", e.target.value)}
                  placeholder="34"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Unknown">Unknown</option>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="photo_url">Photo URL</Label>
            <Input
              id="photo_url"
              value={form.photo_url}
              onChange={(e) => update("photo_url", e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Height, build, hair/eye color, clothing last worn, distinguishing marks, known habits or destinations…"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="md:col-span-1">
              <Label htmlFor="last_seen_location">Last Seen Location</Label>
              <Input
                id="last_seen_location"
                value={form.last_seen_location}
                onChange={(e) => update("last_seen_location", e.target.value)}
                placeholder="Riverside Park, Columbus OH"
              />
            </div>
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={form.last_seen_lat}
                onChange={(e) => update("last_seen_lat", e.target.value)}
                placeholder="39.9612"
              />
            </div>
            <div>
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={form.last_seen_lng}
                onChange={(e) => update("last_seen_lng", e.target.value)}
                placeholder="-82.9988"
              />
            </div>
          </div>

          <div className="md:w-1/3">
            <Label htmlFor="last_seen_date">Last Seen Date</Label>
            <Input
              id="last_seen_date"
              type="date"
              value={form.last_seen_date}
              onChange={(e) => update("last_seen_date", e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-tag border border-tag/40 bg-tag/10 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Create Case"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
