"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CertificateConfig, EmailTemplate } from "@/lib/career/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Upload, X, Plus, Pencil, Trash2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useEdgeStore } from "@/lib/edgestore-client";

interface Props {
  initialConfig: CertificateConfig;
  initialTemplates: EmailTemplate[];
}

// ─── Image upload field ────────────────────────────────────────────────────────
function ImageUploadField({ label, hint, value, onChange }: {
  label: string; hint: string; value: string; onChange: (url: string) => void;
}) {
  const { edgestore } = useEdgeStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFile(file: File) {
    setUploading(true);
    setProgress(0);
    const res = await edgestore.careerImages.upload({
      file,
      onProgressChange: setProgress,
      options: { replaceTargetUrl: value || undefined },
    });
    onChange(res.url);
    setUploading(false);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <p className="text-xs text-muted-foreground mb-2">{hint}</p>
      {value ? (
        <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="h-12 max-w-[120px] object-contain rounded" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate font-mono">{value}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="w-3.5 h-3.5 mr-1" /> Replace
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onChange("")} className="text-destructive hover:text-destructive">
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-border rounded-lg px-4 py-6 text-center hover:border-primary/50 transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <div className="space-y-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Uploading {progress}%…</p>
            </div>
          ) : (
            <>
              <Upload className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload image</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG — max 4MB</p>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
    </div>
  );
}

const TEXT_FIELDS: { key: keyof CertificateConfig; label: string; hint?: string }[] = [
  { key: "companyName", label: "Company Name" },
  { key: "certificateTitle", label: "Certificate Title", hint: 'e.g. "CERTIFICATE OF"' },
  { key: "certificateSubtitle", label: "Certificate Subtitle", hint: 'e.g. "ACHIEVEMENT"' },
  { key: "presentedToLabel", label: "Presented To Label" },
  { key: "descriptionTemplate", label: "Description", hint: "Use {companyName} as a placeholder" },
  { key: "signatoryName", label: "Signatory Name", hint: "Shown if no signature image is uploaded" },
  { key: "signatoryTitle", label: "Signatory Title", hint: 'e.g. "MANAGER, CTO"' },
  { key: "awardLabel", label: "Award Label", hint: 'e.g. "AWARD"' },
  { key: "primaryColor", label: "Primary Color (hex)", hint: "e.g. #ffa500" },
];

// ─── Template card editor ──────────────────────────────────────────────────────
const VARIABLE_HINT = "Variables: {{name}}, {{role}}, {{certUrl}}, {{date}}";

function TemplateCard({
  template,
  onSave,
  onDelete,
}: {
  template: EmailTemplate;
  onSave: (id: string, data: Partial<EmailTemplate>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(template.label);
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function save() {
    setSaving(true);
    await onSave(template.id, { label, subject, body });
    setSaving(false);
    setEditing(false);
  }

  function cancel() {
    setLabel(template.label);
    setSubject(template.subject);
    setBody(template.body);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="border border-[#ffa500]/40 rounded-xl p-4 space-y-3 bg-card shadow-sm">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Template name"
          className="w-full border border-input rounded-lg px-3 py-1.5 text-sm font-semibold bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject line"
          className="w-full border border-input rounded-lg px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Email body (HTML supported)"
          rows={6}
          className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
        />
        <p className="text-xs text-muted-foreground">{VARIABLE_HINT}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={saving || !label} className="flex-1">
            <Check className="w-3.5 h-3.5 mr-1" /> {saving ? "Saving…" : "Save"}
          </Button>
          <Button size="sm" variant="outline" onClick={cancel} className="flex-1">Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl p-4 bg-card hover:border-border/80 transition-colors group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{template.label}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{template.subject || <span className="italic">No subject</span>}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => setEditing(true)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(template.id)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body preview toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? "Hide body" : "Preview body"}
      </button>
      {expanded && (
        <div className="mt-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 max-h-32 overflow-y-auto font-mono whitespace-pre-wrap break-words">
          {template.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "—"}
        </div>
      )}
    </div>
  );
}

// ─── New template form ─────────────────────────────────────────────────────────
function NewTemplateForm({ onAdd }: { onAdd: (tpl: EmailTemplate) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!label) return;
    setSaving(true);
    const res = await fetch("/api/career/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, subject, body, sortOrder: 99 }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      onAdd(data);
      setLabel(""); setSubject(""); setBody("");
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-2 border-dashed border-border rounded-xl p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:border-[#ffa500]/50 hover:text-foreground transition-colors w-full"
      >
        <Plus className="w-4 h-4" /> Add template
      </button>
    );
  }

  return (
    <div className="border border-[#ffa500]/40 rounded-xl p-4 space-y-3 bg-card shadow-sm">
      <p className="text-sm font-semibold text-foreground">New template</p>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Template name (e.g. Certificate)"
        className="w-full border border-input rounded-lg px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject line"
        className="w-full border border-input rounded-lg px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Email body (HTML supported)"
        rows={5}
        className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
      />
      <p className="text-xs text-muted-foreground">{VARIABLE_HINT}</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleAdd} disabled={saving || !label} className="flex-1">
          <Plus className="w-3.5 h-3.5 mr-1" /> {saving ? "Adding…" : "Add"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setOpen(false); setLabel(""); setSubject(""); setBody(""); }} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Main config client ────────────────────────────────────────────────────────
export default function ConfigClient({ initialConfig, initialTemplates }: Props) {
  const router = useRouter();
  const [config, setConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState(initialTemplates);

  function update(key: keyof CertificateConfig, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch("/api/career/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    if (!res.ok) { setError("Failed to save"); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleTemplateSave(id: string, data: Partial<EmailTemplate>) {
    const res = await fetch(`/api/career/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated: EmailTemplate = await res.json();
      setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  }

  async function handleTemplateDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    const res = await fetch(`/api/career/templates/${id}`, { method: "DELETE" });
    if (res.ok) setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/career/admin/dashboard")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground">Certificate design, colors, and email templates</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* ── Certificate settings ── */}
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-sm text-destructive">{error}</div>
          )}

          <div className="bg-card border border-border rounded-xl p-5 space-y-5">
            <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Images</h2>
            <ImageUploadField label="Company Logo" hint="Replaces the default GebetaMaps triangle logo" value={config.companyLogoUrl} onChange={(url) => update("companyLogoUrl", url)} />
            <ImageUploadField label="Signature Image" hint="Manager/CTO signature shown at the bottom of the certificate" value={config.signatorySignatureUrl} onChange={(url) => update("signatorySignatureUrl", url)} />
            <ImageUploadField label="Badge / Seal Image" hint="Gold seal displayed on the right panel of the certificate" value={config.badgeImageUrl} onChange={(url) => update("badgeImageUrl", url)} />
            <ImageUploadField label="Wavy Background Pattern" hint="Background image for the right panel of the certificate" value={config.wavyPatternUrl} onChange={(url) => update("wavyPatternUrl", url)} />
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Text & Colors</h2>
            {TEXT_FIELDS.map(({ key, label, hint }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
                {key === "descriptionTemplate" ? (
                  <textarea value={config[key]} onChange={(e) => update(key, e.target.value)} rows={3}
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                ) : key === "primaryColor" ? (
                  <div className="flex items-center gap-3">
                    <input type="color" value={config[key]} onChange={(e) => update(key, e.target.value)}
                      className="w-10 h-10 rounded border border-input cursor-pointer p-0.5 bg-background" />
                    <input type="text" value={config[key]} onChange={(e) => update(key, e.target.value)}
                      className="flex-1 border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
                  </div>
                ) : (
                  <input type="text" value={config[key]} onChange={(e) => update(key, e.target.value)}
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                )}
                {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/career/admin/dashboard")}>Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1">
              <Save className="w-4 h-4 mr-1" />
              {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
            </Button>
          </div>
        </form>

        {/* ── Email templates ── */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Email Templates</h2>
            <span className="text-xs text-muted-foreground">{templates.length} template{templates.length !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-5">{VARIABLE_HINT}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                onSave={handleTemplateSave}
                onDelete={handleTemplateDelete}
              />
            ))}
            <NewTemplateForm onAdd={(tpl) => setTemplates((prev) => [...prev, tpl])} />
          </div>

          {templates.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No templates yet — add one above. The compose window will show them as selectable options.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
