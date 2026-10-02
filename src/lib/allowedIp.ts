export type AllowedIpEntry = {
    id: string;
    ipAddress: string;
    apiKey: string;
    description: string;
    createdAt: string | null;
};

export function normalizeAllowedIp(entry: Record<string, unknown>): AllowedIpEntry {
    const apiKey = entry.apiKey ?? entry.APIKey;
    const description = entry.description ?? entry.Description;
    const createdAt = entry.createdAt ?? entry.CreatedAt;

    return {
        id: String(entry.id ?? entry.ID ?? ""),
        ipAddress: String(entry.ipAddress ?? entry.IPAddress ?? entry.domain ?? ""),
        apiKey: typeof apiKey === "string" ? apiKey : "",
        description: typeof description === "string" ? description : "",
        createdAt: createdAt ? String(createdAt) : null,
    };
}

export function maskApiKey(apiKey: string): string {
    if (!apiKey) return "—";
    if (apiKey.length <= 8) return "••••••••";
    return `${"•".repeat(Math.min(apiKey.length - 4, 16))}${apiKey.slice(-4)}`;
}

export function formatAllowedIpDate(value: string | null): string {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}
