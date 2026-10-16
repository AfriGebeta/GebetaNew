"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_TIMING, DURATION, EASE, STAGGER } from "@/lib/motion";
import { GEOCODING_DEMO, type Place } from "@/constants/landing";
import { Input } from "@/components/ui/input";
import LiveMap from "./map/live-map";
import { geocode } from "./map/demo-api";
import { sleep } from "./use-loop";

const DEBOUNCE_MS = 200;

const formatCoords = ([lng, lat]: [number, number]) => `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

export default function GeocodeSearchDemo({ className }: { className?: string }) {
    const rootRef = useRef<HTMLDivElement>(null);
    const inView = useInView(rootRef, { amount: 0.3 });
    const reduceMotion = useReducedMotion();
    const [userControlled, setUserControlled] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Place[]>([]);
    // Bumped per search, so a new result set replaces the old one as a whole instead of interleaving.
    const [batch, setBatch] = useState(0);
    const showResults = (hits: Place[]) => {
        setResults(hits);
        setBatch((b) => b + 1);
    };
    const [searching, setSearching] = useState(false);
    const [selected, setSelected] = useState<Place | null>(null);
    // LiveMap animates routes from this; a geocoding demo has none, so it stays at 0.
    const progress = useMotionValue(0);

    const search = async (text: string) => {
        setSearching(true);
        const found = await geocode(text);
        setSearching(false);
        const hits = found.hits.slice(0, GEOCODING_DEMO.maxResults);
        showResults(hits);
        return hits;
    };

    useEffect(() => {
        if (userControlled || !inView) return;
        const controller = new AbortController();
        const { signal } = controller;
        (async () => {
            for (let i = 0; !signal.aborted; i++) {
                const text = GEOCODING_DEMO.autoplay[i % GEOCODING_DEMO.autoplay.length];
                if (reduceMotion) setQuery(text);
                else {
                    for (let c = 1; c <= text.length; c++) {
                        setQuery(text.slice(0, c));
                        await sleep(DEMO_TIMING.typeCharMs, signal);
                    }
                }
                const hits = await search(text);
                if (signal.aborted) return;
                await sleep(DEMO_TIMING.holdResultsMs, signal);
                setSelected(hits[0] ?? null);
                await sleep(DEMO_TIMING.restMs * 2, signal);
            }
        })().catch(() => undefined);
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userControlled, inView, reduceMotion]);

    useEffect(() => {
        if (!userControlled) return;
        if (!query.trim()) {
            showResults([]);
            return;
        }
        let stale = false;
        const id = window.setTimeout(async () => {
            const found = await geocode(query);
            if (!stale) showResults(found.hits.slice(0, GEOCODING_DEMO.maxResults));
        }, DEBOUNCE_MS);
        return () => {
            stale = true;
            window.clearTimeout(id);
        };
    }, [query, userControlled]);

    const scene = useMemo(() => ({ target: selected }), [selected]);

    return (
        <div ref={rootRef} data-ui className={cn("absolute inset-0 flex flex-col bg-card", className)}>
            <form
                role="search"
                className="p-3"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (results[0]) setSelected(results[0]);
                }}
            >
                <label htmlFor="geocoding-search" className="sr-only">
                    Search for a place
                </label>
                <div className="relative">
                    <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                    <Input
                        id="geocoding-search"
                        value={query}
                        autoComplete="off"
                        placeholder={GEOCODING_DEMO.placeholder}
                        onFocus={() => setUserControlled(true)}
                        onChange={(e) => {
                            setUserControlled(true);
                            setQuery(e.target.value);
                        }}
                        className="h-11 pl-9 text-[15px]"
                    />
                </div>
            </form>

            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                <div className="relative max-h-48 overflow-y-auto px-2 pb-2 md:max-h-none md:w-64 md:shrink-0">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.ul
                            key={batch}
                            role="listbox"
                            aria-label="Search results"
                            className="flex flex-col gap-0.5"
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, transition: { duration: DURATION.fast } }}
                            variants={{ hidden: {}, show: { transition: { staggerChildren: STAGGER / 2 } } }}
                        >
                            {results.map((place) => {
                                const active = selected?.id === place.id;
                                return (
                                    <motion.li
                                        key={place.id}
                                        role="option"
                                        aria-selected={active}
                                        variants={{
                                            hidden: { opacity: 0, y: 6 },
                                            show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE.out } },
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUserControlled(true);
                                                setSelected(place);
                                            }}
                                            className={cn(
                                                "flex w-full cursor-pointer items-start gap-2.5 rounded-md px-2 py-2 text-left outline-none transition-colors duration-150 ease-power3-out hover:bg-hover focus-visible:bg-hover",
                                                active && "bg-hover",
                                            )}
                                        >
                                            <MapPin aria-hidden className={cn("mt-0.5 size-4 shrink-0", active ? "text-foreground" : "text-subtle")} />
                                            <span className="flex min-w-0 flex-col gap-1">
                                                <span className="truncate text-[14px] font-medium leading-tight text-foreground">{place.name}</span>
                                                <span className="truncate text-[13px] leading-tight text-soft">{place.area}</span>
                                            </span>
                                        </button>
                                    </motion.li>
                                );
                            })}
                            {!results.length && (
                                <li className="px-2 py-2 text-[13px] text-soft">{searching ? "Searching…" : "Type to search"}</li>
                            )}
                        </motion.ul>
                    </AnimatePresence>
                </div>

                <LiveMap className="min-h-[220px] flex-1" scene={scene} progress={progress} showLabels={false} />
            </div>

            <div className="flex min-h-12 items-center px-4 py-3" aria-live="polite">
                <AnimatePresence mode="wait">
                    {selected ? (
                        <motion.p
                            key={selected.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: DURATION.base, ease: EASE.out }}
                            className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1"
                        >
                            <span className="truncate text-[14px] font-medium text-foreground">{selected.name}</span>
                            <span className="text-[13px] tabular-nums text-soft">{formatCoords(selected.lngLat)}</span>
                        </motion.p>
                    ) : (
                        <motion.span key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] text-soft">
                            {GEOCODING_DEMO.empty}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
