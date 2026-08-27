"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Intern } from "@/lib/career/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Trash2, Plus, Settings, LogOut, Copy, Check } from "lucide-react";
import Image from "next/image";

export default function DashboardClient({ initialInterns }: { initialInterns: Intern[] }) {
  const router = useRouter();
  const [interns, setInterns] = useState(initialInterns);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this certificate? This cannot be undone.")) return;
    setDeleting(id);
    const res = await fetch(`/api/career/interns/${id}`, { method: "DELETE" });
    if (res.ok) setInterns((prev) => prev.filter((i) => i.id !== id));
    setDeleting(null);
  }

  async function handleLogout() {
    await fetch("/api/career/auth/logout", { method: "POST" });
    router.push("/career/admin");
  }

  function copyLink(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/career/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/assets/logo.svg" width={30} height={30} alt="logo" className="ml-[2px]" />
          <span className="font-bold text-foreground">GebetaMaps</span>
          <span className="text-muted-foreground mx-2">/</span>
          <span className="text-muted-foreground text-sm">Certificates</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/career/admin/config")}>
            <Settings className="w-4 h-4 mr-1" /> Settings
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Interns</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {interns.length} certificate{interns.length !== 1 ? "s" : ""} issued
            </p>
          </div>
          <Button onClick={() => router.push("/career/admin/add")}>
            <Plus className="w-4 h-4 mr-1" /> Add Intern
          </Button>
        </div>

        {interns.length === 0 ? (
          <div className="bg-card rounded-xl border border-border text-center py-16">
            <div className="text-4xl mb-3">🎓</div>
            <p className="text-muted-foreground mb-4">No interns yet</p>
            <Button onClick={() => router.push("/career/admin/add")}>
              <Plus className="w-4 h-4 mr-1" /> Add First Intern
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Presented On</TableHead>
                  <TableHead>Certificate URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interns.map((intern) => (
                  <TableRow key={intern.id}>
                    <TableCell className="font-medium">{intern.name}</TableCell>
                    <TableCell className="text-muted-foreground">{intern.role}</TableCell>
                    <TableCell className="text-sm">{intern.presentedOn}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground max-w-[160px] truncate block">
                          /career/{intern.slug}
                        </code>
                        <button onClick={() => copyLink(intern.slug)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                          {copied === intern.slug ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 text-xs">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => window.open(`/career/${intern.slug}`, "_blank")}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deleting === intern.id}
                          onClick={() => handleDelete(intern.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
