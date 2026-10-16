"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/sections/Container";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { STATUS_LEVELS, STATUS_PAGE, statusLevel, type StatusLevel } from "@/constants/status";

interface IncidentInfo {
    summary: string;
    duration: string;
    date: string;
    related: string;
}

interface ServiceStatus {
    service: string;
    downtime_hours: number;
    status: string;
    uptime: number;
    reason?: string | null;
    incident?: IncidentInfo | null;
}

type ServiceDay = ServiceStatus & { date: string };

interface ApiResponse {
    data: { date: string; services: ServiceStatus[] }[];
}

const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/uptime`;
const SKELETON_ROWS = 4;

const average = (days: ServiceDay[]) => days.reduce((sum, d) => sum + d.uptime, 0) / (days.length || 1);
const isIncident = (d: ServiceDay) => !["operational", "maintenance"].includes(statusLevel(d.status, d.uptime));

/** A day's level as shown on the service's current-status label: today's status, not its uptime figure. */
function currentLevel(days: ServiceDay[]): StatusLevel {
    const latest = days[days.length - 1];
    if (!latest) return "operational";
    const level = statusLevel(latest.status, 100);
    return level === "degraded" ? "operational" : level;
}

function StatusDot({ level, className }: { level: StatusLevel; className?: string }) {
    return <span aria-hidden className={cn("inline-block size-2.5 shrink-0 rounded-full", STATUS_LEVELS[level].bar, className)} />;
}

export default function UptimeStatus() {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    // The selected day outlives the dialog's open state, so its content stays put while it animates closed.
    const [selected, setSelected] = useState<ServiceDay | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        fetch(API_URL)
            .then((r) => {
                if (!r.ok) throw new Error("Failed to fetch");
                return r.json() as Promise<ApiResponse>;
            })
            .then(setData)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    // The API lists days newest first; the bars run oldest to newest, left to right.
    const days = useMemo(() => [...(data?.data ?? [])].sort((a, b) => a.date.localeCompare(b.date)), [data]);

    const services = useMemo(() => {
        const byService = new Map<string, ServiceDay[]>();
        for (const day of days) {
            for (const s of day.services) {
                if (!byService.has(s.service)) byService.set(s.service, []);
                byService.get(s.service)!.push({ ...s, date: day.date });
            }
        }
        return Array.from(byService, ([name, days]) => ({ name, days, level: currentLevel(days), uptime: average(days) }));
    }, [days]);

    const dayCount = days.length;
    const latestDate = days[dayCount - 1]?.date;
    const overall: StatusLevel = services.some((s) => s.level === "major")
        ? "major"
        : services.some((s) => s.level === "minor")
          ? "minor"
          : "operational";
    const avgUptime = services.length ? (services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2) : "0";

    return (
        <Container>
            <div className="mx-auto flex max-w-4xl flex-col gap-10 py-16 md:py-24">
                <header className="flex flex-col gap-4">
                    <h1 className="text-[44px] font-medium leading-[1] tracking-[-0.035em] text-foreground md:text-[64px]">{STATUS_PAGE.title}</h1>
                    <p className="max-w-[48ch] text-[18px] leading-[1.5] text-soft">{STATUS_PAGE.description}</p>
                </header>

                <Card className="flex flex-col gap-1 p-6" aria-live="polite">
                    {loading ? (
                        <>
                            <Skeleton className="h-6 w-56" />
                            <Skeleton className="mt-2 h-4 w-72" />
                        </>
                    ) : error ? (
                        <p className="flex items-center gap-3 text-[18px] font-medium text-foreground">
                            <StatusDot level="major" />
                            {STATUS_PAGE.error}
                        </p>
                    ) : (
                        <>
                            <p className="flex items-center gap-3 text-[22px] font-medium tracking-[-0.01em] text-foreground">
                                <StatusDot level={overall} className="size-3" />
                                {overall === "operational" ? STATUS_PAGE.allOperational : STATUS_PAGE.someAffected}
                            </p>
                            <p className="pl-6 text-[15px] text-soft">
                                {STATUS_PAGE.averageUptime(avgUptime, dayCount)}
                                {latestDate && <> · {STATUS_PAGE.lastUpdated(latestDate)}</>}
                            </p>
                        </>
                    )}
                </Card>

                {!error && (
                    <section className="flex flex-col gap-4">
                        <Card className="divide-y divide-border p-0">
                            {loading
                                ? Array.from({ length: SKELETON_ROWS }, (_, i) => (
                                      <div key={i} className="flex flex-col gap-3 px-6 py-5">
                                          <Skeleton className="h-4 w-32" />
                                          <Skeleton className="h-9 w-full" />
                                      </div>
                                  ))
                                : services.map(({ name, days, level, uptime }) => (
                                      <div key={name} className="flex flex-col gap-3 px-6 py-5">
                                          <div className="flex items-center justify-between gap-3">
                                              <h2 className="text-[16px] font-medium text-foreground">{name}</h2>
                                              <span className={cn("flex items-center gap-2 text-[14px] font-medium", STATUS_LEVELS[level].text)}>
                                                  <StatusDot level={level} />
                                                  {STATUS_LEVELS[level].label}
                                              </span>
                                          </div>
                                          <div className="flex h-9 items-stretch gap-[2px]">
                                              {days.map((d) => {
                                                  const dayLevel = statusLevel(d.status, d.uptime);
                                                  const incident = isIncident(d);
                                                  const label = `${name}, ${d.date}: ${d.uptime}% uptime${d.downtime_hours ? `, ${d.downtime_hours} h down` : ""}, ${d.status}`;
                                                  return (
                                                      <button
                                                          type="button"
                                                          key={d.date}
                                                          title={label}
                                                          aria-label={label}
                                                          disabled={!incident}
                                                          onClick={() => {
                                                              setSelected(d);
                                                              setDialogOpen(true);
                                                          }}
                                                          className={cn(
                                                              "flex-1 rounded-[3px] outline-none transition-opacity duration-150 focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-default",
                                                              STATUS_LEVELS[dayLevel].bar,
                                                              incident && "cursor-pointer hover:opacity-80",
                                                          )}
                                                      />
                                                  );
                                              })}
                                          </div>
                                          <div className="flex items-center justify-between text-[13px] text-subtle">
                                              <span>{days[0]?.date}</span>
                                              <span className="font-medium tabular-nums text-soft">{uptime.toFixed(2)}% uptime</span>
                                              <span>{days[days.length - 1]?.date}</span>
                                          </div>
                                      </div>
                                  ))}
                        </Card>

                        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-[13px] text-soft">
                            <ul className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Legend">
                                {(Object.keys(STATUS_LEVELS) as StatusLevel[]).map((level) => (
                                    <li key={level} className="flex items-center gap-2">
                                        <span aria-hidden className={cn("size-2.5 rounded-[3px]", STATUS_LEVELS[level].bar)} />
                                        {STATUS_LEVELS[level].label}
                                    </li>
                                ))}
                            </ul>
                            <span className="text-subtle">{STATUS_PAGE.incidentHint}</span>
                        </div>
                    </section>
                )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    {selected && (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {selected.service}: {selected.incident?.summary ?? selected.status}
                                </DialogTitle>
                                <DialogDescription>{selected.incident?.related ?? selected.reason ?? selected.status}</DialogDescription>
                            </DialogHeader>
                            <DialogBody>
                                <dl className="grid grid-cols-3 gap-3 text-[14px]">
                                    {[
                                        { label: "Date", value: selected.incident?.date ?? selected.date },
                                        { label: "Duration", value: selected.incident?.duration ?? `${selected.downtime_hours} h` },
                                        { label: "Uptime", value: `${selected.uptime}%` },
                                    ].map((item) => (
                                        <div key={item.label} className="flex flex-col gap-1">
                                            <dt className="text-[13px] text-subtle">{item.label}</dt>
                                            <dd className="font-medium tabular-nums text-foreground">{item.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                                {selected.reason && (
                                    <p className="rounded-md bg-raised px-3 py-2 text-[14px] text-soft">
                                        <span className="font-medium text-foreground">Reason:</span> {selected.reason}
                                    </p>
                                )}
                            </DialogBody>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
}
