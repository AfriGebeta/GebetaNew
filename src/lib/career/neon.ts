import { neon } from "@neondatabase/serverless";

export function getDb() {
  const connStr = process.env.DB_CONNECTION_STRING!.replace(/[&?]channel_binding=require/g, "");
  return neon(connStr);
}

let initialized = false;

export async function initCareerTables() {
  if (initialized) return;
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS career_interns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      presented_on TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS career_config (
      id INTEGER PRIMARY KEY,
      company_name TEXT DEFAULT 'GebetaMaps',
      company_logo_url TEXT DEFAULT '/cert-logo.png',
      certificate_title TEXT DEFAULT 'CERTIFICATE OF',
      certificate_subtitle TEXT DEFAULT 'ACHIEVEMENT',
      presented_to_label TEXT DEFAULT 'THIS IS PROUDLY PRESENTED TO',
      description_template TEXT DEFAULT 'This certificate acknowledges your participation in the {companyName} Internship Program and your Dedication, Skill, and Outstanding Commitment',
      signatory_name TEXT DEFAULT 'Signature',
      signatory_title TEXT DEFAULT 'MANAGER, CTO',
      signatory_signature_url TEXT DEFAULT '',
      badge_image_url TEXT DEFAULT '/cert-seal.png',
      wavy_pattern_url TEXT DEFAULT '/cert-wavy.png',
      primary_color TEXT DEFAULT '#C9A227',
      award_label TEXT DEFAULT 'AWARD'
    )
  `;

  await sql`
    ALTER TABLE career_config ADD COLUMN IF NOT EXISTS wavy_pattern_url TEXT DEFAULT '/cert-wavy.png'
  `;

  await sql`INSERT INTO career_config (id) VALUES (1) ON CONFLICT DO NOTHING`;
  initialized = true;
}
