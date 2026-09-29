import { getPool, getSql as getDb } from "./pool";

export interface DownloadClick {
  id: string;
  createdAt: string;
  platform: string;
  source: string;
  sourceType: string;
  medium: string;
  campaign: string;
  content: string;
  referrer: string;
  landedOn: string;
  userAgent: string;
  country: string;
  isBot: boolean;
}

export interface CountRow {
  label: string;
  count: number;
}

export interface DownloadStats {
  total: number;
  today: number;
  bots: number;
  bySource: CountRow[];
  bySourceType: CountRow[];
  byMedium: CountRow[];
  byCampaign: CountRow[];
  byPlatform: CountRow[];
  byReferrer: CountRow[];
  daily: CountRow[];
  recent: DownloadClick[];
}

let initialized = false;

export async function initDownloadTables() {
  if (initialized) return;
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS download_clicks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      platform TEXT NOT NULL DEFAULT 'other',
      source TEXT NOT NULL DEFAULT 'direct',
      source_type TEXT NOT NULL DEFAULT 'unknown',
      medium TEXT NOT NULL DEFAULT '',
      campaign TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      referrer TEXT NOT NULL DEFAULT '',
      landed_on TEXT NOT NULL DEFAULT '',
      user_agent TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '',
      ip TEXT NOT NULL DEFAULT '',
      is_bot BOOLEAN NOT NULL DEFAULT FALSE
    )
  `;

  await sql`ALTER TABLE download_clicks ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'unknown'`;

  await sql`CREATE INDEX IF NOT EXISTS download_clicks_created_at_idx ON download_clicks (created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS download_clicks_source_idx ON download_clicks (source)`;

  initialized = true;
}

export interface ClickInput {
  platform: string;
  source: string;
  sourceType: string;
  medium: string;
  campaign: string;
  content: string;
  referrer: string;
  landedOn: string;
  userAgent: string;
  country: string;
  ip: string;
  isBot: boolean;
}

export async function recordClick(click: ClickInput) {
  const sql = getDb();
  await sql`
    INSERT INTO download_clicks
      (platform, source, source_type, medium, campaign, content, referrer, landed_on, user_agent, country, ip, is_bot)
    VALUES
      (${click.platform}, ${click.source}, ${click.sourceType}, ${click.medium}, ${click.campaign}, ${click.content},
       ${click.referrer}, ${click.landedOn}, ${click.userAgent}, ${click.country}, ${click.ip}, ${click.isBot})
  `;
}

function rowToClick(row: Record<string, unknown>): DownloadClick {
  return {
    id: row.id as string,
    createdAt: (row.created_at as Date).toISOString(),
    platform: (row.platform as string) ?? "other",
    source: (row.source as string) ?? "direct",
    sourceType: (row.source_type as string) ?? "unknown",
    medium: (row.medium as string) ?? "",
    campaign: (row.campaign as string) ?? "",
    content: (row.content as string) ?? "",
    referrer: (row.referrer as string) ?? "",
    landedOn: (row.landed_on as string) ?? "",
    userAgent: (row.user_agent as string) ?? "",
    country: (row.country as string) ?? "",
    isBot: Boolean(row.is_bot),
  };
}

function rowsToCounts(rows: Record<string, unknown>[]): CountRow[] {
  return rows.map((r) => ({
    label: (r.label as string) || "(none)",
    count: Number(r.count),
  }));
}

// `days` = 0 means all time. Bot hits (link previews from TikTok/LinkedIn crawlers)
// are counted separately and left out of every other number.
export async function readDownloadStats(days = 30): Promise<DownloadStats> {
  const sql = getDb();
  const since = days > 0 ? `${days} days` : "100 years";

  // Column names can't be bound as parameters, so they come from this fixed list only.
  const GROUPABLE = ["source", "source_type", "medium", "campaign", "platform", "referrer"] as const;
  const pool = getPool();
  const window = async (column: (typeof GROUPABLE)[number]) => {
    const { rows } = await pool.query(
      `SELECT COALESCE(NULLIF(${column}, ''), '(none)') AS label, COUNT(*) AS count
       FROM download_clicks
       WHERE is_bot = FALSE AND created_at >= NOW() - $1::interval
       GROUP BY 1 ORDER BY count DESC LIMIT 25`,
      [since]
    );
    return rowsToCounts(rows);
  };

  const [totals, bySource, bySourceType, byMedium, byCampaign, byPlatform, byReferrer, daily, recent] =
    await Promise.all([
      sql`
        SELECT
          COUNT(*) FILTER (WHERE is_bot = FALSE) AS total,
          COUNT(*) FILTER (WHERE is_bot = FALSE AND created_at >= date_trunc('day', NOW())) AS today,
          COUNT(*) FILTER (WHERE is_bot = TRUE) AS bots
        FROM download_clicks
        WHERE created_at >= NOW() - ${since}::interval
      `,
      window("source"),
      window("source_type"),
      window("medium"),
      window("campaign"),
      window("platform"),
      window("referrer"),
      sql`
        SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS label, COUNT(*) AS count
        FROM download_clicks
        WHERE is_bot = FALSE AND created_at >= NOW() - ${since}::interval
        GROUP BY 1 ORDER BY 1 ASC
      `,
      sql`
        SELECT * FROM download_clicks
        WHERE is_bot = FALSE
        ORDER BY created_at DESC LIMIT 50
      `,
    ]);

  const t = (totals as Record<string, unknown>[])[0] ?? {};

  return {
    total: Number(t.total ?? 0),
    today: Number(t.today ?? 0),
    bots: Number(t.bots ?? 0),
    bySource,
    bySourceType,
    byMedium,
    byCampaign,
    byPlatform,
    byReferrer,
    daily: rowsToCounts(daily as Record<string, unknown>[]),
    recent: (recent as Record<string, unknown>[]).map(rowToClick),
  };
}
