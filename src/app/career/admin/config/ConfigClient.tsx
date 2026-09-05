"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CertificateConfig } from "@/lib/career/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { useEdgeStore } from "@/lib/edgestore-client";

interface Props {
  initialConfig: CertificateConfig;
}

function ImageUploadField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (url: string) => void;
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
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
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
  { key: "awardLabel", label: "Award Label", hint: 'Text shown at the top, e.g. "AWARD"' },
  { key: "primaryColor", label: "Primary Color (hex)", hint: "e.g. #C9A227" },
];

export default function ConfigClient({ initialConfig }: Props) {
  const router = useRouter();
  const [config, setConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/career/admin/dashboard")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-foreground">Certificate Settings</h1>
          <p className="text-xs text-muted-foreground">Customize logos, text, colors and signatures</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-sm text-destructive">{error}</div>
          )}

          {/* Image uploads */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-5">
            <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Images</h2>
            <ImageUploadField
              label="Company Logo"
              hint="Replaces the default GebetaMaps triangle logo"
              value={config.companyLogoUrl}
              onChange={(url) => update("companyLogoUrl", url)}
            />
            <ImageUploadField
              label="Signature Image"
              hint="Manager/CTO signature shown at the bottom of the certificate"
              value={config.signatorySignatureUrl}
              onChange={(url) => update("signatorySignatureUrl", url)}
            />
            <ImageUploadField
              label="Badge / Seal Image"
              hint="Gold seal displayed on the right panel of the certificate"
              value={config.badgeImageUrl}
              onChange={(url) => update("badgeImageUrl", url)}
            />
            <ImageUploadField
              label="Wavy Background Pattern"
              hint="Background image for the right panel of the certificate"
              value={config.wavyPatternUrl}
              onChange={(url) => update("wavyPatternUrl", url)}
            />
          </div>

          {/* Text fields */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Text & Colors</h2>
            {TEXT_FIELDS.map(({ key, label, hint }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
                {key === "descriptionTemplate" ? (
                  <textarea
                    value={config[key]}
                    onChange={(e) => update(key, e.target.value)}
                    rows={3}
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                ) : key === "primaryColor" ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config[key]}
                      onChange={(e) => update(key, e.target.value)}
                      className="w-10 h-10 rounded border border-input cursor-pointer p-0.5 bg-background"
                    />
                    <input
                      type="text"
                      value={config[key]}
                      onChange={(e) => update(key, e.target.value)}
                      className="flex-1 border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={config[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
                {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/career/admin/dashboard")}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              <Save className="w-4 h-4 mr-1" />
              {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
