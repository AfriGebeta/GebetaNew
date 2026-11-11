import { Pool } from "pg";

let pool: Pool | null = null;

// Own pool so download tracking stays independent of any other feature.
export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DB_CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}

export function getSql() {
  const client = getPool();
  return async function sql(strings: TemplateStringsArray, ...values: unknown[]) {
    let text = "";
    strings.forEach((s, i) => {
      text += s;
      if (i < values.length) text += `$${i + 1}`;
    });
    const result = await client.query(text, values as unknown[]);
    return result.rows as Record<string, unknown>[];
  };
}
