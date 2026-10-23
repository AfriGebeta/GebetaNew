export type Period = "week" | "month" | "quarter" | "year";

export const PERIODS: { value: Period; label: string; days: number }[] = [
  { value: "week", label: "Week", days: 7 },
  { value: "month", label: "Month", days: 30 },
  { value: "quarter", label: "Quarter", days: 90 },
  { value: "year", label: "Year", days: 365 },
];

const DAY_MS = 24 * 60 * 60 * 1000;

const toIso = (date: Date) => date.toJSON().slice(0, 10);
const parseIso = (iso: string) => new Date(`${iso}T00:00:00Z`);

export function rangeForPeriod(period: Period, now = new Date()) {
  const days = PERIODS.find((p) => p.value === period)?.days ?? 30;
  return { start: toIso(new Date(now.getTime() - days * DAY_MS)), end: toIso(now) };
}

export function periodForRange(start: string, end: string): Period | null {
  const match = PERIODS.find((p) => {
    const range = rangeForPeriod(p.value);
    return range.start === start && range.end === end;
  });
  return match?.value ?? null;
}

export function previousRange(start: string, end: string) {
  const startDate = parseIso(start);
  const length = Math.round((parseIso(end).getTime() - startDate.getTime()) / DAY_MS) + 1;
  const prevEnd = new Date(startDate.getTime() - DAY_MS);
  const prevStart = new Date(prevEnd.getTime() - (length - 1) * DAY_MS);
  return { start: toIso(prevStart), end: toIso(prevEnd) };
}

export type DaySeries = Map<string, number>;

export function parseGraphResponse(response: unknown): DaySeries | null {
  const raw = (response as { data?: { data?: { data?: unknown } } } | undefined)?.data?.data?.data;
  if (!raw || typeof raw !== "object") return null;
  const series: DaySeries = new Map();
  Object.values(raw as Record<string, { day?: string; total?: string | number }>).forEach((entry) => {
    if (!entry?.day) return;
    const date = new Date(entry.day);
    if (Number.isNaN(date.getTime())) return;
    const day = date.toISOString().slice(0, 10);
    series.set(day, (series.get(day) ?? 0) + (parseInt(String(entry.total ?? 0), 10) || 0));
  });
  return series;
}

export function sumSeries(series: DaySeries | null | undefined) {
  if (!series) return 0;
  let total = 0;
  series.forEach((value) => {
    total += value;
  });
  return total;
}

type Bucket = { key: string; label: string; phrase: string; days: string[] };

const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const monthShort = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const monthLong = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export function buildBuckets(start: string, end: string): Bucket[] {
  const startDate = parseIso(start);
  const endDate = parseIso(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) return [];

  const days: string[] = [];
  for (let t = startDate.getTime(); t <= endDate.getTime(); t += DAY_MS) days.push(toIso(new Date(t)));

  if (days.length <= 31) {
    return days.map((day) => {
      const label = monthDay.format(parseIso(day));
      return { key: day, label, phrase: `on ${label}`, days: [day] };
    });
  }

  if (days.length <= 120) {
    const buckets: Bucket[] = [];
    for (let i = 0; i < days.length; i += 7) {
      const slice = days.slice(i, i + 7);
      const label = monthDay.format(parseIso(slice[0]));
      buckets.push({ key: slice[0], label, phrase: `in the week of ${label}`, days: slice });
    }
    return buckets;
  }

  const byMonth = new Map<string, Bucket>();
  days.forEach((day) => {
    const key = day.slice(0, 7);
    if (!byMonth.has(key)) {
      const date = parseIso(day);
      byMonth.set(key, { key, label: monthShort.format(date), phrase: `in ${monthLong.format(date)}`, days: [] });
    }
    byMonth.get(key)!.days.push(day);
  });
  return Array.from(byMonth.values());
}

export const BAND_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];
export const HIGHLIGHT_COLOR = "hsl(var(--chart-highlight))";


export type Band = { id: string; label: string; types: string[]; color: string };
export type Column = { key: string; label: string; phrase: string; values: number[]; total: number };

export function buildModel(
  start: string,
  end: string,
  seriesByType: Record<string, DaySeries | null>,
  typeLabels: Record<string, string>,
) {
  const totals = Object.entries(seriesByType)
    .map(([type, series]) => ({ type, total: sumSeries(series) }))
    .filter((entry) => entry.total > 0)
    .sort((a, b) => b.total - a.total);

  const top = totals.slice(0, 3);
  const rest = totals.slice(3);
  const bands: Band[] = top.map((entry, index) => ({
    id: entry.type,
    label: typeLabels[entry.type] ?? entry.type,
    types: [entry.type],
    color: BAND_COLORS[index],
  }));
  if (rest.length) {
    bands.push({ id: "__other", label: "Other", types: rest.map((entry) => entry.type), color: BAND_COLORS[3] });
  }

  const columns: Column[] = buildBuckets(start, end).map((bucket) => {
    const values = bands.map((band) =>
      band.types.reduce(
        (sum, type) => sum + bucket.days.reduce((daySum, day) => daySum + (seriesByType[type]?.get(day) ?? 0), 0),
        0,
      ),
    );
    return { key: bucket.key, label: bucket.label, phrase: bucket.phrase, values, total: values.reduce((a, b) => a + b, 0) };
  });

  const maxTotal = columns.reduce((max, column) => Math.max(max, column.total), 0);
  const total = totals.reduce((sum, entry) => sum + entry.total, 0);
  return { bands, columns, axisMax: niceMax(maxTotal), total };
}

export function niceMax(maxTotal: number) {
  const target = maxTotal * 1.05;
  if (target <= 0) return 4;
  const power = 10 ** Math.floor(Math.log10(target));
  for (const step of [1, 2, 5, 10]) {
    if (step * power >= target) return Math.max(step * power, 4);
  }
  return 10 * power;
}

const trimDecimal = (value: number) => value.toFixed(1).replace(/\.0$/, "");

export function abbreviate(value: number) {
  if (value >= 1_000_000) return `${trimDecimal(value / 1_000_000)}M`;
  if (value >= 1_000) return `${trimDecimal(value / 1_000)}k`;
  return String(Math.round(value));
}

export const formatFull = (value: number) => Math.round(value).toLocaleString("en-US");
