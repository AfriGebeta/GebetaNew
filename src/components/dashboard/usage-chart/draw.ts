import { resolveColor } from "@/lib/tokens";
import { HIGHLIGHT_COLOR } from "./data";

export const BAND_GAP = 4;
export const MIN_BAND = 6;

export type Hover = { col: number; band: number | null } | null;

export type DrawBand = { color: string; height: number };
export type DrawColumn = { bands: DrawBand[]; grow: number };

export type Segment = { band: number; top: number; bottom: number };
export type ColumnGeometry = { x0: number; x1: number; segments: Segment[] };

type Radii = { tl: number; tr: number; br: number; bl: number };

function roundedPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: Radii) {
  const limit = Math.min(w / 2, h / 2);
  const tl = Math.min(r.tl, limit);
  const tr = Math.min(r.tr, limit);
  const br = Math.min(r.br, limit);
  const bl = Math.min(r.bl, limit);
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);
  ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);
  ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}

function hash(x: number, y: number) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

const smoothstep = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

function fillTiles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  tile: number,
  time: number,
  scale: number,
) {
  ctx.beginPath();
  for (let gy = y; gy < y + h; gy += tile) {
    const fromBottom = (y + h - (gy + tile / 2)) / h;
    const falloff = smoothstep(fromBottom);
    for (let gx = x; gx < x + w; gx += tile) {
      const flow =
        (Math.sin(gx * 0.045 + time * 0.9) +
          Math.sin(gy * 0.06 - time * 0.7) +
          Math.sin((gx + gy) * 0.028 + time * 0.45)) /
        3;
      const jitter = hash(gx * 7.3, gy * 3.1);
      const size = Math.min(
        tile * 1.1,
        tile * (0.6 + 0.38 * falloff) * (0.86 + 0.18 * flow) * (0.88 + 0.24 * jitter) * scale,
      );
      if (size < 0.5) continue;
      const nudge = (hash(gy * 1.7, gx * 5.9) - 0.5) * tile * 0.22;
      const offset = (tile - size) / 2;
      ctx.rect(gx + offset + nudge, gy + offset, size, size);
    }
  }
  ctx.fill();
}

export function drawChart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  columns: DrawColumn[],
  hover: Hover,
  time: number,
): ColumnGeometry[] {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  if (!columns.length || width <= 0 || height <= 0) return [];

  const colWidth = width / columns.length;
  const barWidth = Math.min(colWidth * 0.62, 54);
  const tile = Math.max(3, Math.round(width / 200));
  const geometry: ColumnGeometry[] = [];

  columns.forEach((column, c) => {
    const x = c * colWidth + (colWidth - barWidth) / 2;
    const visible = column.bands
      .map((band, index) => ({ ...band, index }))
      .filter((band) => band.height > 0.5);
    const segments: Segment[] = [];
    let bottom = height;

    visible.forEach((band, i) => {
      const isBottom = i === 0;
      const isTop = i === visible.length - 1;
      const top = bottom - band.height;
      const radii = { tl: isTop ? 8 : 5, tr: isTop ? 8 : 5, br: isBottom ? 7 : 5, bl: isBottom ? 7 : 5 };

      const columnHovered = hover?.col === c;
      const bandHovered = columnHovered && hover?.band === band.index;
      let alpha = 1;
      if (hover && !columnHovered) alpha = 0.3;
      else if (columnHovered && hover?.band !== null && !bandHovered) alpha = 0.48;

      ctx.save();
      roundedPath(ctx, x, top, barWidth, band.height, radii);
      ctx.clip();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = resolveColor(bandHovered ? HIGHLIGHT_COLOR : band.color);
      fillTiles(ctx, x, top, barWidth, band.height, tile, time, (bandHovered ? 1.25 : 1) * column.grow);
      ctx.restore();

      if (bandHovered) {
        ctx.save();
        roundedPath(ctx, x, top, barWidth, band.height, radii);
        ctx.lineWidth = 1.75;
        ctx.strokeStyle = resolveColor(HIGHLIGHT_COLOR);
        ctx.shadowColor = resolveColor(HIGHLIGHT_COLOR);
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      segments.push({ band: band.index, top, bottom });
      bottom = top - BAND_GAP;
    });

    geometry.push({ x0: x, x1: x + barWidth, segments });
  });

  return geometry;
}

export function hitTest(geometry: ColumnGeometry[], width: number, x: number, y: number): Hover {
  if (!geometry.length || x < 0 || x > width) return null;
  const col = Math.min(geometry.length - 1, Math.max(0, Math.floor((x / width) * geometry.length)));
  const column = geometry[col];
  if (x < column.x0 || x > column.x1) return { col, band: null };
  for (const segment of column.segments) {
    if (y >= segment.top - BAND_GAP / 2) return { col, band: segment.band };
  }
  return { col, band: null };
}
