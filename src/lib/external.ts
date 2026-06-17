const EXTERNAL_API =
    process.env.NEXT_PUBLIC_EXTERNAL_API_URL ?? "https://api.traffic.gebeta.app";

export interface ExternalPlace {
    id?: string | number;
    name: string;
    lat: number;
    lng: number;
    owner: string;
    image?: string;
    type?: string;
    active?: boolean;
}

export interface CreateExternalPlaceInput {
    name: string;
    lat: number;
    lng: number;
    image?: string;
    owner: string;
    type?: string;
    active?: boolean;
}

export async function getAllExternalPlaces(owner: string): Promise<ExternalPlace[] | undefined> {
    try {
        const res = await fetch(
            `${EXTERNAL_API}/api/external/place?owner=${encodeURIComponent(owner)}`,
            { cache: "no-store" }
        );
        console.log("places fetch status:", res.status, "data:", res, "owner:", owner);
        if (!res.ok) throw new Error(`Failed to fetch places: ${res.status}`);
        return res.json();
    } catch (error) {
        console.error("places fetch failed:", error); // ADD — was silent before
    }
}

export async function createExternalPlace(data: CreateExternalPlaceInput): Promise<void> {
    const res = await fetch(`${EXTERNAL_API}/api/external/place/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create place: ${res.status}`);
}

export async function createManyExternalPlaces(data: CreateExternalPlaceInput[]): Promise<void> {
    const res = await fetch(`${EXTERNAL_API}/api/external/place/create-many`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ places: data }),
    });
    if (!res.ok) throw new Error(`Failed to bulk create: ${res.status}`);
}