"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function AddInternClient() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", role: "", presentedOn: "" });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ slug: string; name: string } | null>(null);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/career/interns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed to create"); return; }
    setCreated({ slug: data.slug, name: data.name });
  }

  if (created) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Certificate Created!</h2>
          <p className="text-muted-foreground mb-6">
            The certificate for <strong>{created.name}</strong> has been generated.
          </p>
          <div className="bg-muted rounded-lg px-4 py-3 mb-6">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Certificate URL</p>
            <a
              href={`/career/${created.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-mono break-all text-primary hover:underline"
            >
              {window.location.origin}/career/{created.slug}
            </a>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/career/admin/dashboard")}>
              Back to Dashboard
            </Button>
            <Button className="flex-1" onClick={() => window.open(`/career/${created.slug}`, "_blank")}>
              View Certificate
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/career/admin/dashboard")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-foreground">Add Intern</h1>
          <p className="text-xs text-muted-foreground">Generate a new certificate</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">
        <div className="bg-card rounded-xl border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                placeholder="Selam Tesfaye"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {form.name && (
                <p className="text-xs text-muted-foreground mt-1">
                  Slug:{" "}
                  <span className="font-mono">
                    /career/{form.name.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-")}-xxxx
                  </span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Role / Position <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                required
                placeholder="Software Engineering Intern"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Presented On
              </label>
              <input
                type="date"
                value={form.presentedOn}
                onChange={(e) => update("presentedOn", e.target.value)}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">Leave blank to use today&apos;s date</p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Generating..." : "Generate Certificate"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
