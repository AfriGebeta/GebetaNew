"use client";

import { useEffect, useState } from "react";

interface IncidentInfo {
    summary: string;
    duration: string;
    date: string;
    related: string;
}

interface ServiceDay {
    date: string;
    downtime_hours: number;
    status: string;
    uptime: number;
    reason?: string | null;
    incident?: IncidentInfo | null;
    service: string;
}

interface ApiDay {
    date: string;
    services: {
        downtime_hours: number;
        service: string;
        status: string;
        uptime: number;
        reason?: string | null;
        incident?: IncidentInfo | null;
    }[];
}

interface ApiResponse {
    data: ApiDay[];
}

const API_URL = "https://mapapi.gebeta.app/api/v1/uptime";

function statusColor(status: string, uptime: number) {
    if (status ===  "Scheduled Maintenance")
        return "bg-[hsl(210,95%,55%)]"; // blue

    if (status === "Major Outage" || uptime < 90)
        return "bg-[hsl(0,75%,55%)]";

    if (status === "Minor Incident" || uptime < 99)
        return "bg-[hsl(35,95%,55%)]";

    if (uptime < 99.7)
        return "bg-[hsl(48,95%,55%)]";

    return "bg-[hsl(140,60%,45%)]";
}

function overallStatusForService(days: ServiceDay[]) {
    const latest = days[days.length - 1];

    if (!latest)
        return {
            label: "Unknown",
            color: "text-gray-500",
        };

    if (latest.status === "Server Upgrade")
        return {
            label: "Server Upgrade",
            color: "text-[hsl(210,95%,45%)]",
        };

    if (latest.status === "Major Outage")
        return {
            label: "Major Outage",
            color: "text-[hsl(0,75%,50%)]",
        };

    if (latest.status === "Minor Incident")
        return {
            label: "Minor Incident",
            color: "text-[hsl(35,95%,45%)]",
        };

    return {
        label: "Operational",
        color: "text-[hsl(140,60%,38%)]",
    };
}

function LegendDot({
                       className,
                       label,
                   }: {
    className: string;
    label: string;
}) {
    return (
        <span className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-sm ${className}`} />
            {label}
        </span>
    );
}

export default function UptimeStatus() {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<ServiceDay | null>(null);

    useEffect(() => {
        fetch(API_URL)
            .then((r) => {
                if (!r.ok) throw new Error("Failed to fetch");
                return r.json() as Promise<ApiResponse>;
            })
            .then((json) => setData(json))
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    // Close modal on ESC
    useEffect(() => {
        if (!selected) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSelected(null);
            }
        };

        window.addEventListener("keydown", onKey);

        return () => {
            window.removeEventListener("keydown", onKey);
        };
    }, [selected]);

    const byService: Record<string, ServiceDay[]> = {};

    if (data) {
        for (const day of data.data) {
            for (const s of day.services) {
                if (!byService[s.service]) {
                    byService[s.service] = [];
                }

                byService[s.service].push({
                    date: day.date,
                    downtime_hours: s.downtime_hours,
                    status: s.status,
                    uptime: s.uptime,
                    reason: s.reason,
                    incident: s.incident,
                    service: s.service,
                });
            }
        }
    }

    const serviceNames = Object.keys(byService);

    const allOperational = serviceNames.every((n) => {
        const latest = byService[n][byService[n].length - 1];

        return (
            latest &&
            (latest.status === "Operational" ||
                latest.status === "Server Upgrade")
        );
    });

    const avgUptime = serviceNames.length
        ? (
            serviceNames.reduce((acc, n) => {
                const days = byService[n];

                const avg =
                    days.reduce((sum, d) => sum + d.uptime, 0) /
                    days.length;

                return acc + avg;
            }, 0) / serviceNames.length
        ).toFixed(2)
        : "0";

    const incidentsByService: Record<string, ServiceDay[]> = {};

    for (const name of serviceNames) {
        const incs = byService[name].filter(
            (d) =>
                d.status !== "Operational" &&
                d.status !== "Server Upgrade",
        );

        if (incs.length) {
            incidentsByService[name] = incs;
        }
    }

    return (
        <div className="min-h-screen mt-[5%] bg-[#fffaf3]">
            <header className="border-b border-[#f1e4cf] bg-white/70 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[hsl(32,100%,52%)] font-bold text-white">
                            G
                        </div>

                        <span className="text-xl font-semibold text-[#2b2b2b]">
                            GebetaMaps Status
                        </span>
                    </div>

                    <a
                        href="https://gebeta.app"
                        className="rounded-md bg-[#1a1a1a] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:bg-black"
                    >
                        Subscribe to Updates
                    </a>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10">
                <div
                    className={`rounded-xl px-8 py-7 text-white shadow-sm ${
                        loading
                            ? "bg-gray-400"
                            : error
                                ? "bg-[hsl(0,75%,55%)]"
                                : allOperational
                                    ? "bg-[hsl(140,55%,42%)]"
                                    : "bg-[hsl(35,95%,50%)]"
                    }`}
                >
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        {loading
                            ? "Loading status…"
                            : error
                                ? "Unable to fetch status"
                                : allOperational
                                    ? "All Systems Operational"
                                    : "Some Systems Affected"}
                    </h1>

                    {!loading && !error && (
                        <p className="mt-1 text-sm opacity-90">
                            Average uptime across all services: {avgUptime}%
                        </p>
                    )}
                </div>

                <section className="mt-10">
                    <div className="mb-4 flex items-end justify-between">
                        <div />

                        <p className="text-sm text-[#7a6f5e]">
                            Uptime over the past {data?.data.length ?? 0} days.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-[#f1e4cf] bg-white">
                        {error && (
                            <div className="p-6 text-sm text-red-600">
                                Error: {error}
                            </div>
                        )}

                        {!error &&
                            serviceNames.map((name, idx) => {
                                const days = byService[name];

                                const overall =
                                    overallStatusForService(days);

                                const avg = (
                                    days.reduce(
                                        (sum, d) => sum + d.uptime,
                                        0,
                                    ) / days.length
                                ).toFixed(2);

                                return (
                                    <div
                                        key={name}
                                        className={`px-6 py-5 ${
                                            idx !== 0
                                                ? "border-t border-[#f5ecdb]"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-semibold text-[#2b2b2b]">
                                                {name === "OSM"
                                                    ? "ONM"
                                                    : name}
                                            </h3>

                                            <span
                                                className={`text-sm font-semibold ${overall.color}`}
                                            >
                                                {overall.label}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex h-10 items-stretch gap-[2px]">
                                            {days.map((d) => {
                                                const isIncident =
                                                    d.status !==
                                                    "Operational" &&
                                                    d.status !==
                                                    "Server Upgrade";

                                                return (
                                                    <button
                                                        type="button"
                                                        key={d.date}
                                                        onClick={() =>
                                                            isIncident &&
                                                            setSelected(d)
                                                        }
                                                        title={`${d.date} — ${d.uptime}% uptime${
                                                            d.downtime_hours
                                                                ? ` · ${d.downtime_hours}h downtime`
                                                                : ""
                                                        } · ${d.status}`}
                                                        className={`flex-1 rounded-sm transition-transform hover:scale-y-110 ${statusColor(
                                                            d.status,
                                                            d.uptime,
                                                        )} ${
                                                            isIncident
                                                                ? "cursor-pointer"
                                                                : "cursor-default"
                                                        }`}
                                                        aria-label={`${name} on ${d.date}`}
                                                    />
                                                );
                                            })}
                                        </div>

                                        <div className="mt-2 flex items-center justify-between text-xs text-[#9a8f7e]">
                                            <span>{days[0]?.date}</span>

                                            <span className="font-medium text-[#7a6f5e]">
                                                {avg}% uptime
                                            </span>

                                            <span>Today</span>
                                        </div>
                                    </div>
                                );
                            })}

                        {loading &&
                            !error &&
                            Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`px-6 py-5 ${
                                        i !== 0
                                            ? "border-t border-[#f5ecdb]"
                                            : ""
                                    }`}
                                >
                                    <div className="h-4 w-32 animate-pulse rounded bg-[#f1e4cf]" />

                                    <div className="mt-3 h-10 animate-pulse rounded bg-[#faf0dc]" />
                                </div>
                            ))}
                    </div>
                </section>

                <div className="mt-6 flex flex-wrap gap-4 text-xs text-[#7a6f5e]">
                    <LegendDot
                        className="bg-[hsl(140,60%,45%)]"
                        label="Operational"
                    />

                    <LegendDot
                        className="bg-[hsl(210,95%,55%)]"
                        label="Server Upgrade"
                    />

                    <LegendDot
                        className="bg-[hsl(48,95%,55%)]"
                        label="Degraded"
                    />

                    <LegendDot
                        className="bg-[hsl(35,95%,55%)]"
                        label="Minor Incident"
                    />

                    <LegendDot
                        className="bg-[hsl(0,75%,55%)]"
                        label="Major Outage"
                    />
                </div>

                <footer className="mt-12 border-t border-[#f1e4cf] pt-6 text-center text-xs text-[#9a8f7e]">
                    Data from Gebeta Maps
                </footer>
            </main>

            {/* Modal */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setSelected(null)}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                    <div
                        className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelected(null)}
                            aria-label="Close"
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md text-[#9a8f7e] hover:bg-[#fff7e8] hover:text-[#2b2b2b]"
                        >
                            ✕
                        </button>

                        <h2 className="pr-8 text-lg font-bold text-[#2b2b2b]">
                            {selected.incident?.summary ??
                                selected.status}{" "}
                            — {selected.service}
                        </h2>

                        <p className="mt-1 text-sm text-[#7a6f5e]">
                            {selected.incident?.related ??
                                selected.reason ??
                                "Incident details"}
                        </p>

                        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-[#9a8f7e]">
                                    Date
                                </dt>

                                <dd className="font-medium text-[#2b2b2b]">
                                    {selected.incident?.date ??
                                        selected.date}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-[#9a8f7e]">
                                    Duration
                                </dt>

                                <dd className="font-medium text-[#2b2b2b]">
                                    {selected.incident?.duration ??
                                        `${selected.downtime_hours} hrs`}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-[#9a8f7e]">
                                    Uptime
                                </dt>

                                <dd className="font-medium text-[#2b2b2b]">
                                    {selected.uptime}%
                                </dd>
                            </div>
                        </dl>

                        {selected.reason && (
                            <div className="mt-4 rounded-md bg-[#fff7e8] px-3 py-2 text-sm text-[#7a6f5e]">
                                <span className="font-semibold text-[#2b2b2b]">
                                    Reason:
                                </span>{" "}
                                {selected.reason}
                            </div>
                        )}

                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                className="rounded-md bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
