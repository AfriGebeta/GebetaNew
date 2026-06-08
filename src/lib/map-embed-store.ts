import { GebetaAuth } from "@gebeta/node";

const auth = new GebetaAuth({ serverToken: process.env.GEBETA_SERVER_TOKEN! });

export interface EmbedSession {
    clientToken: string;
    lat: number;
    lng: number;
    zoom: number;
    markers: Array<{ lat: number; lng: number; label?: string }>;
    createdAt: number;
}

const sessions = new Map<string, EmbedSession>();

function cleanup() {
    const now = Date.now();
    for (const [id, s] of sessions.entries()) {
        if (now - s.createdAt > 24 * 60 * 60 * 1000) sessions.delete(id);
    }
}

export function setEmbedSession(id: string, session: EmbedSession) {
    cleanup();
    sessions.set(id, session);
}

export function getEmbedSession(id: string): EmbedSession | undefined {
    return sessions.get(id);
}

export async function mintTokens(clientToken: string) {
    return auth.authenticate(clientToken);
}