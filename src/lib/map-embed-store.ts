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
    owner: string;
    zoom: number;
    minZoom: number;
    maxZoom: number;
    bounds?: [number, number, number, number] | null; // [west, south, east, north]
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