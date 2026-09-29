"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadStats, CountRow } from "@/lib/downloads/db";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, RefreshCw, LogOut } from "lucide-react";

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "All time", days: 0 },
];

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl px-5 py-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-3xl font-bold text-foreground mt-1">{value.toLocaleString()}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function Breakdown({ title, rows, empty }: { title: string; rows: CountRow[]; empty: string }) {
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0) || 1;
  const total = rows.reduce((s, r) => s + r.count, 0) || 1;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-semibold text-foreground mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.label} className="relative rounded-md overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-orange-500/15"
                style={{ width: `${(row.count / max) * 100}%` }}
              />
              <div className="relative flex items-center justify-between px-2.5 py-1.5 text-sm">
                <span className="text-foreground truncate mr-3">{row.label}</span>
                <span className="text-muted-foreground shrink-0">
                  {row.count.toLocaleString()}
                  <span className="ml-2 text-xs">{Math.round((row.count / total) * 100)}%</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DownloadsClient({ initialStats }: { initialStats: DownloadStats }) {
  const router = useRouter();
  const [stats, setStats] = useState(initialStats);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);

  async function load(nextDays: number) {
    setDays(nextDays);
    setLoading(true);
    try {
      const res = await fetch(`/api/downloads/stats?days=${nextDays}`);
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/downloads/auth", { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-foreground">Download clicks</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-1" /> Logout
        </Button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">/download clicks</h1>
            <p className="text-sm text-muted-foreground">
              Every hit on gebeta.app/download, grouped by where it came from.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {RANGES.map((r) => (
              <Button
                key={r.days}
                variant={days === r.days ? "default" : "outline"}
                size="sm"
                onClick={() => load(r.days)}
                disabled={loading}
              >
                {r.label}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => load(days)} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total clicks" value={stats.total} hint="Bots excluded" />
          <StatCard label="Today" value={stats.today} />
          <StatCard label="Bot / preview hits" value={stats.bots} hint="Link previews, crawlers" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Breakdown title="Source" rows={stats.bySource} empty="No clicks yet." />
          <Breakdown title="Campaign" rows={stats.byCampaign} empty="No campaign tags yet." />
          <Breakdown title="Medium" rows={stats.byMedium} empty="No medium tags yet." />
          <Breakdown title="Platform" rows={stats.byPlatform} empty="No clicks yet." />
          <Breakdown title="Referrer" rows={stats.byReferrer} empty="No referrers recorded." />
          <Breakdown
            title="How it was attributed"
            rows={stats.bySourceType}
            empty="No clicks yet."
          />
          <Breakdown title="Per day" rows={stats.daily} empty="No clicks yet." />
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Latest 50 clicks</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Referrer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      Nothing recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recent.map((click) => (
                    <TableRow key={click.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {new Date(click.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{click.source}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{click.campaign || "—"}</TableCell>
                      <TableCell className="text-sm">{click.platform}</TableCell>
                      <TableCell className="text-sm">{click.country || "—"}</TableCell>
                      <TableCell className="text-sm max-w-[240px] truncate">
                        {click.referrer || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
