"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { getUserUsageForGraph } from "@/service/apis";
import { cn } from "@/lib/utils";
import {
  PERIODS,
  abbreviate,
  buildModel,
  formatFull,
  parseGraphResponse,
  periodForRange,
  previousRange,
  rangeForPeriod,
  sumSeries,
  type DaySeries,
  type Period,
} from "./data";
import { MIN_BAND, drawChart, hitTest, type ColumnGeometry, type Hover } from "./draw";

const EASE = [0.19, 1, 0.22, 1] as const;
const GROW_MS = 620;
const PLOT_HEIGHT = 220;
const GRID_STEPS = [1, 0.75, 0.5, 0.25, 0];

const CARD =
  "rounded-[10px] bg-card shadow-card";

type UsageChartProps = {
  token?: string;
  types: string[];
  typeLabels: Record<string, string>;
  start: string;
  end: string;
  onRangeChange: (start: string, end: string) => void;
};

function SpringNumber({
  value,
  format,
  reduced,
  className,
}: {
  value: number;
  format: (value: number) => string;
  reduced: boolean;
  className?: string;
}) {
  const spring = useSpring(0, { stiffness: 190, damping: 27, mass: 0.7 });
  const text = useTransform(spring, (v) => format(Math.max(0, v)));
  useEffect(() => {
    if (reduced) spring.jump(value);
    else spring.set(value);
  }, [value, reduced, spring]);
  return <motion.span className={className}>{text}</motion.span>;
}

export default function UsageChart({ token, types, typeLabels, start, end, onRangeChange }: UsageChartProps) {
  const reduced = !!useReducedMotion();
  const period = periodForRange(start, end);
  const prev = previousRange(start, end);

  const typeQueries = useQueries({
    queries: types.map((type) => ({
      queryKey: ["usage-graph", token, type, start, end],
      queryFn: () => getUserUsageForGraph(type, start, end, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!token,
    })),
  });

  const prevQuery = useQuery({
    queryKey: ["usage-graph-prev", token, [...types].sort().join(","), prev.start, prev.end],
    queryFn: () => getUserUsageForGraph(types.join(","), prev.start, prev.end, token),
    staleTime: 5 * 60 * 1000,
    enabled: !!token && types.length > 0,
  });

  const loading = typeQueries.some((query) => query.isLoading);
  const dataKey = typeQueries.map((query) => query.dataUpdatedAt).join("|");

  const model = useMemo(() => {
    const seriesByType: Record<string, DaySeries | null> = {};
    types.forEach((type, index) => {
      seriesByType[type] = parseGraphResponse(typeQueries[index]?.data);
    });
    return buildModel(start, end, seriesByType, typeLabels);
  }, [dataKey, start, end, types.join(","), typeLabels]);

  const prevTotal = sumSeries(parseGraphResponse(prevQuery.data));
  const change = prevTotal > 0 ? Math.round(((model.total - prevTotal) / prevTotal) * 100) : null;

  const [hover, setHover] = useState<Hover>(null);
  const hoverRef = useRef<Hover>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const setHoverRef = useRef<(next: Hover) => void>(() => {});
  const hoveredColumn = hover ? model.columns[hover.col] : undefined;
  const hoveredBand = hover?.band != null ? model.bands[hover.band] : undefined;

  const periodWord = period ? PERIODS.find((p) => p.value === period)!.label.toLowerCase() : null;
  const rangePhrase = periodWord ? `this ${periodWord}` : "in this range";

  let heroValue = model.total;
  let subline = `calls ${rangePhrase}`;
  let badgeLabel: string | null = null;
  if (hoveredColumn) {
    heroValue = hoveredBand ? hoveredColumn.values[hover!.band!] : hoveredColumn.total;
    badgeLabel = hoveredBand ? `${hoveredColumn.label} · ${hoveredBand.label}` : hoveredColumn.label;
    subline = hoveredBand ? `${hoveredBand.label} calls ${hoveredColumn.phrase}` : `calls ${hoveredColumn.phrase}`;
  }

  const plotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const [plotWidth, setPlotWidth] = useState(0);
  const geometryRef = useRef<ColumnGeometry[]>([]);
  const modelRef = useRef(model);
  const reducedRef = useRef(reduced);
  const visibleRef = useRef(true);
  const animRef = useRef<{ from: Record<string, number>[]; to: Record<string, number>[]; start: number }>({
    from: [],
    to: [],
    start: 0,
  });
  const currentRef = useRef<Record<string, number>[]>([]);

  reducedRef.current = reduced;

  useEffect(() => {
    modelRef.current = model;
    const to = model.columns.map((column) =>
      Object.fromEntries(model.bands.map((band, b) => [band.id, column.values[b] / model.axisMax])),
    );
    const from = model.columns.map((_, c) =>
      Object.fromEntries(model.bands.map((band) => [band.id, currentRef.current[c]?.[band.id] ?? 0])),
    );
    animRef.current = { from, to, start: performance.now() };
    if (reducedRef.current) currentRef.current = to;
    hoverRef.current = null;
    setHover(null);
  }, [model]);

  useEffect(() => {
    const plot = plotRef.current;
    const canvas = canvasRef.current;
    if (!plot || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const width = plot.clientWidth;
      const height = plot.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      sizeRef.current = { width, height, dpr };
      setPlotWidth(width);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(plot);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    intersectionObserver.observe(plot);

    let time = 0;
    let frame = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!visibleRef.current) return;
      if (!reducedRef.current) time += 1 / 60;

      const { width, height, dpr } = sizeRef.current;
      const current = modelRef.current;
      const { from, to, start: animStart } = animRef.current;
      const count = current.columns.length;
      const stagger = GROW_MS * Math.min(0.05, 0.4 / Math.max(1, count));

      const columns = current.columns.map((column, c) => {
        const raw = reducedRef.current ? 1 : (now - animStart - c * stagger) / GROW_MS;
        const progress = 1 - (1 - Math.min(1, Math.max(0, raw))) ** 3;
        const fractions: Record<string, number> = {};
        const bands = current.bands.map((band, b) => {
          const fromValue = from[c]?.[band.id] ?? 0;
          const toValue = to[c]?.[band.id] ?? 0;
          const fraction = fromValue + (toValue - fromValue) * progress;
          fractions[band.id] = fraction;
          const target = column.values[b] > 0 ? MIN_BAND * Math.max(progress, fromValue > 0 ? 1 : 0) : 0;
          return { color: band.color, height: Math.max(fraction * height, target) };
        });
        currentRef.current[c] = fractions;
        return { bands, grow: reducedRef.current ? 1 : 0.55 + 0.45 * progress };
      });
      currentRef.current.length = count;

      if (pointerRef.current) {
        setHoverRef.current(hitTest(geometryRef.current, width, pointerRef.current.x, pointerRef.current.y));
      }
      geometryRef.current = drawChart(ctx, width, height, dpr, columns, hoverRef.current, time);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  const updateHover = (next: Hover) => {
    const prevHover = hoverRef.current;
    if (prevHover?.col === next?.col && prevHover?.band === next?.band) return;
    hoverRef.current = next;
    setHover(next);
  };
  setHoverRef.current = updateHover;

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    updateHover(hitTest(geometryRef.current, rect.width, pointerRef.current.x, pointerRef.current.y));
  };

  const handlePointerLeave = () => {
    pointerRef.current = null;
    updateHover(null);
  };

  const columnCount = model.columns.length;
  const labelStride = columnCount && plotWidth ? Math.max(1, Math.ceil(52 / (plotWidth / columnCount))) : 1;
  const empty = !loading && model.total === 0;

  const outer: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } } };
  const tray: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: EASE, staggerChildren: 0.06, delayChildren: 0.03 },
    },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: EASE } },
  };

  return (
    <motion.div variants={outer} initial="hidden" animate="show">
      <motion.div
        variants={tray}
        className="flex flex-col gap-1.5 rounded-[14px] bg-raised p-1.5"
      >
        <motion.div variants={item} className={cn(CARD, "flex flex-col gap-3 p-4")}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-medium leading-none text-foreground">API usage</h3>
            <span className="inline-grid overflow-hidden rounded-full bg-muted px-2 py-1 text-[11.5px] leading-none text-soft">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={periodWord ?? "custom"}
                  className="col-start-1 row-start-1 whitespace-nowrap"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 5, filter: "blur(3px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -5, filter: "blur(3px)" }}
                  transition={{ duration: 0.18, ease: EASE }}
                >
                  {periodWord ? `This ${periodWord}` : "Custom range"}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <SpringNumber
                value={heroValue}
                format={formatFull}
                reduced={reduced}
                className="text-[clamp(26px,3.6vw,31px)] font-semibold leading-none tabular-nums tracking-[-0.02em] text-foreground"
              />
              {badgeLabel ? (
                <span className="truncate text-[12px] font-medium leading-none text-subtle">{badgeLabel}</span>
              ) : (
                change !== null && (
                  <span
                    className={cn(
                      "text-[12px] font-medium leading-none tabular-nums",
                      change >= 0 ? "text-trend" : "text-danger",
                    )}
                    title="Compared with the previous period of the same length"
                  >
                    {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
                  </span>
                )
              )}
            </div>
            <p className="text-[12.5px] leading-none text-subtle">{subline}</p>
          </div>
        </motion.div>

        <motion.div variants={item} className={cn(CARD, "flex flex-col gap-4 p-4")}>
          {model.bands.length > 0 && (
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {model.bands.map((band, index) => (
                <li
                  key={band.id}
                  className={cn(
                    "flex items-center gap-1.5 text-[11.5px] leading-none text-soft transition-opacity duration-150",
                    hover?.band != null && hover.band !== index && "opacity-40",
                  )}
                  style={{ fontWeight: 450 }}
                >
                  <span aria-hidden className="size-[9px] rounded-[3px]" style={{ background: band.color }} />
                  {band.label}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div aria-hidden className="relative w-[30px] shrink-0" style={{ height: PLOT_HEIGHT }}>
                {GRID_STEPS.map((step) => (
                  <span
                    key={step}
                    className="absolute right-0 -translate-y-1/2 text-[10px] leading-none tabular-nums text-faint"
                    style={{ top: `${(1 - step) * 100}%` }}
                  >
                    <SpringNumber value={model.axisMax * step} format={abbreviate} reduced={reduced} />
                  </span>
                ))}
              </div>
              <div
                ref={plotRef}
                role="img"
                aria-label={`API usage chart: ${formatFull(model.total)} calls ${rangePhrase}`}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                className="relative min-w-0 flex-1 rounded-[5px] bg-[repeating-linear-gradient(-45deg,hsl(var(--foreground)/0.04)_0_1px,transparent_1px_7px)]"
                style={{ height: PLOT_HEIGHT }}
              >
                {GRID_STEPS.map((step) =>
                  step === 0 ? (
                    <span key={step} className="absolute inset-x-0 bottom-0 h-[1.5px] bg-line-strong" />
                  ) : (
                    <span
                      key={step}
                      className="absolute inset-x-0 border-t border-dashed border-line-strong/60"
                      style={{ top: `${(1 - step) * 100}%` }}
                    />
                  ),
                )}
                <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
                {(loading || empty) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="caption-style rounded-full bg-card px-3 py-1.5 text-subtle shadow-card">
                      {loading ? "Loading usage…" : types.length ? "No calls in this range" : "Select at least one endpoint"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="relative ml-[38px] h-[11px]">
              {model.columns.map((column, index) => {
                const active = hover?.col === index;
                const show =
                  active || (index % labelStride === 0 && (!hover || Math.abs(index - hover.col) >= labelStride));
                const colWidth = plotWidth / Math.max(1, columnCount);
                return (
                  <span
                    key={column.key}
                    className={cn(
                      "absolute top-0 -translate-x-1/2 truncate whitespace-nowrap text-center text-[11px] leading-none transition-[color,font-weight] [transition-duration:180ms]",
                      active ? "z-10 bg-card font-semibold text-foreground" : "font-normal text-subtle",
                      !show && "invisible",
                    )}
                    style={{ left: (index + 0.5) * colWidth, maxWidth: Math.max(colWidth, labelStride * colWidth - 4) }}
                  >
                    {column.label}
                  </span>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} role="radiogroup" aria-label="Period" className="flex rounded-[10px] bg-muted p-[3px]">
          {PERIODS.map((option) => {
            const active = period === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  const range = rangeForPeriod(option.value as Period);
                  onRangeChange(range.start, range.end);
                }}
                className={cn(
                  "relative flex-1 cursor-pointer rounded-[8px] py-2 text-[12px] leading-none outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/60",
                  active ? "font-semibold text-foreground" : "font-medium text-subtle hover:text-soft",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="usage-period-pill"
                    transition={reduced ? { duration: 0 } : { type: "spring", duration: 0.32, bounce: 0.2 }}
                    className="absolute inset-0 rounded-[8px] bg-card shadow-btn dark:bg-raised-hover"
                  />
                )}
                <span className="relative">{option.label}</span>
              </button>
            );
          })}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
