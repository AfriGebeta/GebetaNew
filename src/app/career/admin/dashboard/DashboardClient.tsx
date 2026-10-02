"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Intern, EmailTemplate } from "@/lib/career/db";
import RichTextEditor from "@/components/ui/rich-text-editor";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink, Trash2, Plus, Settings, LogOut, Copy, Check,
  Mail, Send, X, Minus, Maximize2, Minimize2, ChevronDown,
} from "lucide-react";
import Image from "next/image";

// ─── Template helpers ──────────────────────────────────────────────────────────

function resolveVars(text: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{{${k}}}`, v), text);
}

// ─── ComposeWindow ─────────────────────────────────────────────────────────────
interface ComposeWindowProps {
  title: string;
  right: string; // tailwind class e.g. "right-6"
  onClose: () => void;
  fields: React.ReactNode;
  body: string;
  onBodyChange: (v: string) => void;
  status: { ok: boolean; msg: string } | null;
  onSend: () => void;
  sendLabel: string;
  sendDisabled: boolean;
  templateBar?: React.ReactNode;
}

function ComposeWindow({
  title, right, onClose, fields, body, onBodyChange,
  status, onSend, sendLabel, sendDisabled, templateBar,
}: ComposeWindowProps) {
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const composeStyle = minimized && !expanded
    ? { height: "auto" }
    : expanded
    ? { top: 24, left: 24, right: 24, bottom: 24 }
    : { height: 580 };

  const composeClass = expanded
    ? "fixed z-[200] rounded-xl shadow-2xl border border-border flex flex-col"
    : `fixed bottom-0 ${right} z-[200] w-[500px] rounded-t-xl shadow-2xl border border-border flex flex-col`;

  // Solid white/card background — no transparency so page never bleeds through
  const composeBg = { backgroundColor: "var(--card, #ffffff)" } as React.CSSProperties;

  return (
    <>
      {expanded && (
        <div
          className="fixed inset-0 z-[199] bg-black/60"
          onClick={() => setExpanded(false)}
        />
      )}
      <div className={composeClass} style={{ ...composeStyle, ...composeBg }}>
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer select-none shrink-0 rounded-t-xl"
        style={{ background: "#1f1f1f" }}
        onClick={() => { if (!expanded) setMinimized((v) => !v); }}
      >
        <span className="text-sm font-medium text-white truncate">{title}</span>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!expanded && (
            <button
              className="text-white/70 hover:text-white transition-colors"
              onClick={() => setMinimized((v) => !v)}
              title={minimized ? "Expand" : "Minimise"}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            className="text-white/70 hover:text-white transition-colors"
            onClick={() => { setExpanded((v) => !v); setMinimized(false); }}
            title={expanded ? "Restore" : "Full screen"}
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            className="text-white/70 hover:text-white transition-colors"
            onClick={onClose}
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Fixed fields (To, Subject, etc.) */}
          <div className="shrink-0 border-b border-border">
            {fields}
          </div>

          {/* Template tab bar */}
          {templateBar && (
            <div className="shrink-0 bg-muted/20">
              {templateBar}
            </div>
          )}

          {/* Scrollable body — takes all remaining space */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <RichTextEditor
              value={body}
              onChange={onBodyChange}
              placeholder="Write your message…"
            />
          </div>

          {/* Status */}
          {status && (
            <div className={`shrink-0 mx-4 mb-1 px-3 py-1.5 rounded text-xs ${status.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {status.msg}
            </div>
          )}

          {/* Footer */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-t border-border">
            <button
              onClick={onSend}
              disabled={sendDisabled}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{ background: "#ffa500" }}
            >
              {sendLabel}
              <Send className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
              title="Discard"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
      </div>
    </>
  );
}

// ─── TemplateBar — horizontal scrollable tab switcher ─────────────────────────
function TemplateBar({
  templates,
  selectedId,
  onSelect,
}: {
  templates: EmailTemplate[];
  selectedId: string | null;
  onSelect: (tpl: EmailTemplate | null) => void;
}) {
  if (templates.length === 0) return null;

  const seen = new Set<string>();
  const unique = [...templates, { id: "__custom__", label: "Custom", subject: "", body: "" } as EmailTemplate]
    .filter((t) => { if (seen.has(t.id)) return false; seen.add(t.id); return true; });

  return (
    <div className="flex overflow-x-auto scrollbar-none border-b border-border -mb-px">
      {unique.map((t) => {
        const active = selectedId === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id === "__custom__" ? null : t)}
            className={`shrink-0 px-4 py-2 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
              active
                ? "border-[#ffa500] text-[#1A1A2E]"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export default function DashboardClient({ initialInterns, initialTemplates }: { initialInterns: Intern[]; initialTemplates: EmailTemplate[] }) {
  const router = useRouter();
  const [interns, setInterns] = useState(initialInterns);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [templates] = useState(initialTemplates);

  // Send certificate compose
  const [sendIntern, setSendIntern] = useState<Intern | null>(null);
  const [sendTemplateId, setSendTemplateId] = useState<string | null>(null);
  const [sendBody, setSendBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // Bulk message compose
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkTemplateId, setBulkTemplateId] = useState<string | null>(null);
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkBody, setBulkBody] = useState("");
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  function buildVars(intern: Intern | null): Record<string, string> {
    return {
      name: intern?.name ?? "{{name}}",
      role: intern?.role ?? "{{role}}",
      certUrl: intern ? `${baseUrl}/career/${intern.slug}` : "{{certUrl}}",
      date: intern?.presentedOn ?? "{{date}}",
    };
  }

  function openSend(intern: Intern) {
    setSendIntern(intern);
    setSendStatus(null);
    const first = templates[0] ?? null;
    setSendTemplateId(first?.id ?? null);
    if (first) {
      const vars = buildVars(intern);
      setSendBody(resolveVars(first.body, vars));
    } else {
      setSendBody("");
    }
  }

  function openBulk() {
    setBulkOpen(true);
    setBulkStatus(null);
    const first = templates[0] ?? null;
    setBulkTemplateId(first?.id ?? null);
    if (first) {
      const vars = buildVars(null);
      setBulkSubject(resolveVars(first.subject, vars));
      setBulkBody(resolveVars(first.body, vars));
    } else {
      setBulkSubject("");
      setBulkBody("");
    }
  }

  function handleSendTemplateSelect(tpl: EmailTemplate | null) {
    setSendTemplateId(tpl?.id ?? "__custom__");
    if (!tpl) { setSendBody(""); return; }
    const vars = buildVars(sendIntern);
    setSendBody(resolveVars(tpl.body, vars));
  }

  function handleBulkTemplateSelect(tpl: EmailTemplate | null) {
    setBulkTemplateId(tpl?.id ?? "__custom__");
    if (!tpl) { setBulkSubject(""); setBulkBody(""); return; }
    const vars = buildVars(null);
    setBulkSubject(resolveVars(tpl.subject, vars));
    setBulkBody(resolveVars(tpl.body, vars));
  }

  async function handleSend() {
    if (!sendIntern) return;
    setSending(true);
    setSendStatus(null);
    const res = await fetch("/api/career/interns/send-certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: sendIntern.slug, message: sendBody }),
    });
    const data = await res.json();
    setSending(false);
    setSendStatus(res.ok ? { ok: true, msg: "Sent!" } : { ok: false, msg: data.error ?? "Failed" });
    if (res.ok) setTimeout(() => setSendIntern(null), 1500);
  }

  async function handleBulkSend() {
    setBulkSending(true);
    setBulkStatus(null);
    const res = await fetch("/api/career/interns/bulk-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: bulkSubject, message: bulkBody }),
    });
    const data = await res.json();
    setBulkSending(false);
    setBulkStatus(res.ok
      ? { ok: true, msg: `Sent to ${data.sent}/${data.total} interns` }
      : { ok: false, msg: data.error ?? "Failed" });
    if (res.ok) setTimeout(() => setBulkOpen(false), 1800);
  }

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
    navigator.clipboard.writeText(`${baseUrl}/career/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  }

  const internsWithEmail = interns.filter((i) => i.email);
  const bulkRight = sendIntern ? "right-[520px]" : "right-6";
  const isEmpty = (html: string) => !html || html === "<p></p>";

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
          <div className="flex items-center gap-2">
            {internsWithEmail.length > 0 && (
              <Button variant="outline" onClick={openBulk}>
                <Send className="w-4 h-4 mr-1" /> Bulk Message
              </Button>
            )}
            <Button onClick={() => router.push("/career/admin/add")}>
              <Plus className="w-4 h-4 mr-1" /> Add Intern
            </Button>
          </div>
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
                  <TableHead>Email</TableHead>
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
                    <TableCell className="text-sm text-muted-foreground">
                      {intern.email || <span className="text-muted-foreground/40 italic text-xs">—</span>}
                    </TableCell>
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
                        {intern.email && (
                          <Button variant="ghost" size="sm" title="Send certificate by email" onClick={() => openSend(intern)}>
                            <Mail className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => window.open(`/career/${intern.slug}`, "_blank")}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
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

      {/* ── Send Certificate compose ── */}
      {sendIntern && (
        <ComposeWindow
          key={`send-${sendIntern.id}`}
          title={`To: ${sendIntern.name}`}
          right="right-6"
          onClose={() => setSendIntern(null)}
          fields={
            <div className="px-4 py-2 text-sm border-b border-border flex items-center gap-2">
              <span className="text-muted-foreground w-5 shrink-0 text-xs">To</span>
              <span className="text-foreground truncate">{sendIntern.email}</span>
            </div>
          }
          templateBar={
            templates.length > 0 ? (
              <TemplateBar
                templates={templates}
                selectedId={sendTemplateId}
                onSelect={handleSendTemplateSelect}
              />
            ) : undefined
          }
          body={sendBody}
          onBodyChange={setSendBody}
          status={sendStatus}
          onSend={handleSend}
          sendLabel={sending ? "Sending…" : "Send"}
          sendDisabled={sending || !!sendStatus?.ok || isEmpty(sendBody)}
        />
      )}

      {/* ── Bulk Message compose ── */}
      {bulkOpen && (
        <ComposeWindow
          key="bulk"
          title={`New message · ${internsWithEmail.length} recipient${internsWithEmail.length !== 1 ? "s" : ""}`}
          right={bulkRight}
          onClose={() => setBulkOpen(false)}
          fields={
            <>
              <div className="px-4 py-2 text-sm border-b border-border flex items-center gap-2">
                <span className="text-muted-foreground w-5 shrink-0 text-xs">To</span>
                <span className="text-muted-foreground text-xs italic">All interns with email ({internsWithEmail.length})</span>
              </div>
              <div className="border-b border-border">
                <input
                  type="text"
                  value={bulkSubject}
                  onChange={(e) => setBulkSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full px-4 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </>
          }
          templateBar={
            templates.length > 0 ? (
              <TemplateBar
                templates={templates}
                selectedId={bulkTemplateId}
                onSelect={handleBulkTemplateSelect}
              />
            ) : undefined
          }
          body={bulkBody}
          onBodyChange={setBulkBody}
          status={bulkStatus}
          onSend={handleBulkSend}
          sendLabel={bulkSending ? "Sending…" : "Send"}
          sendDisabled={bulkSending || !bulkSubject || isEmpty(bulkBody) || !!bulkStatus?.ok}
        />
      )}
    </div>
  );
}
