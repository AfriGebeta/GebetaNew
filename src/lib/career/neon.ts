import { Pool } from "pg";

let pool: Pool | null = null;

export function getDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DB_CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

// Tag-template helper so call sites keep the same `sql\`...\`` syntax
export function getTaggedDb() {
  const client = getDb();
  return async function sql(strings: TemplateStringsArray, ...values: unknown[]) {
    let text = "";
    strings.forEach((s, i) => {
      text += s;
      if (i < values.length) text += `$${i + 1}`;
    });
    const result = await client.query(text, values as unknown[]);
    return result.rows;
  };
}

let initialized = false;

export async function initCareerTables() {
  if (initialized) return;
  const sql = getTaggedDb();

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
      primary_color TEXT DEFAULT '#ffa500',
      award_label TEXT DEFAULT 'AWARD'
    )
  `;

  await sql`
    ALTER TABLE career_config ADD COLUMN IF NOT EXISTS wavy_pattern_url TEXT DEFAULT '/cert-wavy.png'
  `;

  await sql`
    ALTER TABLE career_interns ADD COLUMN IF NOT EXISTS email TEXT DEFAULT ''
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS career_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      label TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Remove duplicate labels (keep the oldest row per label) then enforce uniqueness
  await sql`
    DELETE FROM career_templates
    WHERE id NOT IN (
      SELECT DISTINCT ON (label) id
      FROM career_templates
      ORDER BY label, created_at ASC
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS career_templates_label_uq ON career_templates (label)
  `;

  await sql`INSERT INTO career_config (id) VALUES (1) ON CONFLICT DO NOTHING`;

  // Seed default templates — ON CONFLICT (label) DO NOTHING prevents duplicates
  const defaults = [
    {
      label: "Certificate",
      subject: "Your GebetaMaps Certificate — {{name}}",
      body: `<p>Dear {{name}},</p><p>Congratulations! 🎉 We are proud to present you with your <strong>GebetaMaps Certificate of Achievement</strong> for your outstanding contribution as <strong>{{role}}</strong>.</p><p>Your dedication, skill, and commitment throughout your internship have been truly remarkable. This certificate is a testament to everything you accomplished with us.</p><p>You can view and download your certificate here:<br><a href="{{certUrl}}">{{certUrl}}</a></p><p>We wish you continued success in all your future endeavors.</p><p>Warm regards,<br><strong>GebetaMaps Team</strong></p>`,
      sort_order: 0,
    },
    {
      label: "Follow-up",
      subject: "Checking in — {{name}}",
      body: `<p>Hi {{name}},</p><p>We hope you're doing well! We wanted to reach out and see how things have been going since your time with us as <strong>{{role}}</strong>.</p><p>We'd love to hear about your journey and stay connected. Feel free to reply to this email anytime.</p><p>Best regards,<br><strong>GebetaMaps Team</strong></p>`,
      sort_order: 1,
    },
    {
      label: "Congrats",
      subject: "Congratulations, {{name}}!",
      body: `<p>Dear {{name}},</p><p>We wanted to take a moment to congratulate you on completing your role as <strong>{{role}}</strong> at GebetaMaps.</p><p>It has been a pleasure having you on the team. We are confident that your skills and experience will take you far, and we look forward to seeing everything you accomplish next.</p><p>Best wishes,<br><strong>GebetaMaps Team</strong></p>`,
      sort_order: 2,
    },
    {
      label: "Invitation",
      subject: "You're invited — GebetaMaps",
      body: `<p>Dear {{name}},</p><p>As a valued alumnus of GebetaMaps, we would like to invite you to an upcoming event. Your experience as <strong>{{role}}</strong> makes you a wonderful addition to this gathering.</p><p>We will be sharing more details very soon. Please let us know if you're interested — we'd love to have you!</p><p>Best regards,<br><strong>GebetaMaps Team</strong></p>`,
      sort_order: 3,
    },
  ];

  for (const t of defaults) {
    await sql`
      INSERT INTO career_templates (label, subject, body, sort_order)
      VALUES (${t.label}, ${t.subject}, ${t.body}, ${t.sort_order})
      ON CONFLICT (label) DO NOTHING
    `;
  }
  initialized = true;
}
