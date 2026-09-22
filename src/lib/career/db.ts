import { getTaggedDb as getDb } from "./neon";

export interface Intern {
  id: string;
  name: string;
  slug: string;
  role: string;
  email: string;
  presentedOn: string;
  createdAt: string;
}

export interface CertificateConfig {
  companyName: string;
  companyLogoUrl: string;
  certificateTitle: string;
  certificateSubtitle: string;
  presentedToLabel: string;
  descriptionTemplate: string;
  signatoryName: string;
  signatoryTitle: string;
  signatorySignatureUrl: string;
  badgeImageUrl: string;
  wavyPatternUrl: string;
  primaryColor: string;
  awardLabel: string;
}

const DEFAULT_CONFIG: CertificateConfig = {
  companyName: "GebetaMaps",
  companyLogoUrl: "/cert-logo.png",
  certificateTitle: "CERTIFICATE OF",
  certificateSubtitle: "ACHIEVEMENT",
  presentedToLabel: "THIS IS PROUDLY PRESENTED TO",
  descriptionTemplate:
    "This certificate acknowledges your participation in the {companyName} Internship Program and your Dedication, Skill, and Outstanding Commitment",
  signatoryName: "Signature",
  signatoryTitle: "MANAGER, CTO",
  signatorySignatureUrl: "",
  badgeImageUrl: "/cert-seal.png",
  wavyPatternUrl: "/cert-wavy.png",
  primaryColor: "#ffa500",
  awardLabel: "AWARD",
};

function rowToIntern(row: Record<string, unknown>): Intern {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    role: row.role as string,
    email: (row.email as string) ?? "",
    presentedOn: row.presented_on as string,
    createdAt: (row.created_at as Date).toISOString(),
  };
}

function rowToConfig(row: Record<string, unknown>): CertificateConfig {
  return {
    companyName: (row.company_name as string) ?? DEFAULT_CONFIG.companyName,
    companyLogoUrl: (row.company_logo_url as string) || "/cert-logo.png",
    certificateTitle: (row.certificate_title as string) ?? DEFAULT_CONFIG.certificateTitle,
    certificateSubtitle: (row.certificate_subtitle as string) ?? DEFAULT_CONFIG.certificateSubtitle,
    presentedToLabel: (row.presented_to_label as string) ?? DEFAULT_CONFIG.presentedToLabel,
    descriptionTemplate: (row.description_template as string) ?? DEFAULT_CONFIG.descriptionTemplate,
    signatoryName: (row.signatory_name as string) ?? DEFAULT_CONFIG.signatoryName,
    signatoryTitle: (row.signatory_title as string) ?? DEFAULT_CONFIG.signatoryTitle,
    signatorySignatureUrl: (row.signatory_signature_url as string) ?? "",
    badgeImageUrl: (row.badge_image_url as string) || "/cert-seal.png",
    wavyPatternUrl: (row.wavy_pattern_url as string) || "/cert-wavy.png",
    primaryColor: (row.primary_color as string) ?? DEFAULT_CONFIG.primaryColor,
    awardLabel: (row.award_label as string) ?? DEFAULT_CONFIG.awardLabel,
  };
}

export async function readInterns(): Promise<Intern[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM career_interns ORDER BY created_at DESC`;
  return rows.map(rowToIntern);
}

export async function createIntern(data: Omit<Intern, "id" | "createdAt">): Promise<Intern> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO career_interns (name, slug, role, email, presented_on)
    VALUES (${data.name}, ${data.slug}, ${data.role}, ${data.email ?? ""}, ${data.presentedOn})
    RETURNING *
  `;
  return rowToIntern(rows[0]);
}

export async function deleteIntern(id: string): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`DELETE FROM career_interns WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function getInternBySlug(slug: string): Promise<Intern | null> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM career_interns WHERE slug = ${slug} LIMIT 1`;
  return rows.length ? rowToIntern(rows[0]) : null;
}

export async function readConfig(): Promise<CertificateConfig> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM career_config WHERE id = 1`;
  return rows.length ? rowToConfig(rows[0]) : DEFAULT_CONFIG;
}

export async function writeConfig(config: Partial<CertificateConfig>): Promise<CertificateConfig> {
  const sql = getDb();
  const c = { ...DEFAULT_CONFIG, ...config };
  await sql`
    INSERT INTO career_config (
      id, company_name, company_logo_url, certificate_title, certificate_subtitle,
      presented_to_label, description_template, signatory_name, signatory_title,
      signatory_signature_url, badge_image_url, wavy_pattern_url, primary_color, award_label
    ) VALUES (
      1, ${c.companyName}, ${c.companyLogoUrl}, ${c.certificateTitle}, ${c.certificateSubtitle},
      ${c.presentedToLabel}, ${c.descriptionTemplate}, ${c.signatoryName}, ${c.signatoryTitle},
      ${c.signatorySignatureUrl}, ${c.badgeImageUrl}, ${c.wavyPatternUrl}, ${c.primaryColor}, ${c.awardLabel}
    )
    ON CONFLICT (id) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      company_logo_url = EXCLUDED.company_logo_url,
      certificate_title = EXCLUDED.certificate_title,
      certificate_subtitle = EXCLUDED.certificate_subtitle,
      presented_to_label = EXCLUDED.presented_to_label,
      description_template = EXCLUDED.description_template,
      signatory_name = EXCLUDED.signatory_name,
      signatory_title = EXCLUDED.signatory_title,
      signatory_signature_url = EXCLUDED.signatory_signature_url,
      badge_image_url = EXCLUDED.badge_image_url,
      wavy_pattern_url = EXCLUDED.wavy_pattern_url,
      primary_color = EXCLUDED.primary_color,
      award_label = EXCLUDED.award_label
  `;
  return readConfig();
}

// ─── Email templates ──────────────────────────────────────────────────────────

export interface EmailTemplate {
  id: string;
  label: string;
  subject: string;
  body: string;
  sortOrder: number;
  createdAt: string;
}

function rowToTemplate(row: Record<string, unknown>): EmailTemplate {
  return {
    id: row.id as string,
    label: row.label as string,
    subject: row.subject as string,
    body: row.body as string,
    sortOrder: row.sort_order as number,
    createdAt: (row.created_at as Date).toISOString(),
  };
}

export async function readTemplates(): Promise<EmailTemplate[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM career_templates ORDER BY sort_order ASC, created_at ASC`;
  return rows.map(rowToTemplate);
}

export async function createTemplate(data: Omit<EmailTemplate, "id" | "createdAt">): Promise<EmailTemplate> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO career_templates (label, subject, body, sort_order)
    VALUES (${data.label}, ${data.subject}, ${data.body}, ${data.sortOrder})
    RETURNING *
  `;
  return rowToTemplate(rows[0]);
}

export async function updateTemplate(id: string, data: Partial<Omit<EmailTemplate, "id" | "createdAt">>): Promise<EmailTemplate | null> {
  const sql = getDb();
  const rows = await sql`
    UPDATE career_templates
    SET
      label      = COALESCE(${data.label ?? null}, label),
      subject    = COALESCE(${data.subject ?? null}, subject),
      body       = COALESCE(${data.body ?? null}, body),
      sort_order = COALESCE(${data.sortOrder ?? null}, sort_order)
    WHERE id = ${id}
    RETURNING *
  `;
  return rows.length ? rowToTemplate(rows[0]) : null;
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`DELETE FROM career_templates WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function getSlugExists(slug: string): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`SELECT 1 FROM career_interns WHERE slug = ${slug} LIMIT 1`;
  return rows.length > 0;
}
