export const STATUS_PAGE = {
    title: "System status",
    description: "Availability of the GebetaMaps APIs, day by day.",
    loading: "Checking status…",
    error: "We couldn't load the status right now. Please try again shortly.",
    allOperational: "All systems operational",
    someAffected: "Some systems affected",
    averageUptime: (value: string, days: number) => `${value}% average uptime over the past ${days} days`,
    lastUpdated: (date: string) => `Latest data ${date}`,
    incidentHint: "Select a coloured day to see what happened.",
};

export type StatusLevel = "operational" | "maintenance" | "degraded" | "minor" | "major";

export const STATUS_LEVELS: Record<StatusLevel, { label: string; bar: string; text: string }> = {
    operational: { label: "Operational", bar: "bg-success", text: "text-success" },
    maintenance: { label: "Maintenance", bar: "bg-[var(--ds-tag-blue-text)]", text: "text-[var(--ds-tag-blue-text)]" },
    degraded: { label: "Degraded", bar: "bg-warning/50", text: "text-warning" },
    minor: { label: "Minor incident", bar: "bg-warning", text: "text-warning" },
    major: { label: "Major outage", bar: "bg-danger", text: "text-danger" },
};

export const MAINTENANCE_STATUSES = ["Scheduled Maintenance", "Server Upgrade"];

export function statusLevel(status: string, uptime: number): StatusLevel {
    if (MAINTENANCE_STATUSES.includes(status)) return "maintenance";
    if (status === "Major Outage" || uptime < 90) return "major";
    if (status === "Minor Incident" || uptime < 99) return "minor";
    if (uptime < 99.7) return "degraded";
    return "operational";
}
