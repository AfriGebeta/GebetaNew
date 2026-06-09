import { EncryptJWT, jwtDecrypt } from "jose";
import { GebetaAuth } from "@gebeta/node";

const SECRET = new Uint8Array(
    Buffer.from(process.env.EMBED_SECRET ?? "0".repeat(64), "hex")
);

export interface EmbedSession {
    serverToken: string;
    clientToken: string;
    lat: number;
    lng: number;
    zoom: number;
    markers: Array<{ lat: number; lng: number; label?: string }>;
    fenceCoords?: Array<[number, number]> | null; // [[lng,lat], ...] closed polygon
}

export async function createEmbedToken(session: EmbedSession): Promise<string> {
    return new EncryptJWT({ ...session })
        .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
        .setIssuedAt()
        .encrypt(SECRET);
}

export async function verifyEmbedToken(token: string): Promise<EmbedSession> {
    const { payload } = await jwtDecrypt(token, SECRET, { requiredClaims: [] });
    return payload as unknown as EmbedSession;
}

export async function mintTokens(serverToken: string, clientToken: string) {
    const auth = new GebetaAuth({ serverToken });
    return auth.authenticate(clientToken);
}