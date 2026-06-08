import { EncryptJWT, jwtDecrypt } from "jose";
import { GebetaAuth } from "@gebeta/node";

// 256-bit key required for AES-256 encryption
const SECRET = new Uint8Array(
    Buffer.from(
        process.env.EMBED_SECRET ?? "0".repeat(64), // must be 64 hex chars = 32 bytes
        "hex"
    )
);

export interface EmbedSession {
    serverToken: string;
    clientToken: string;
    lat: number;
    lng: number;
    zoom: number;
    markers: Array<{ lat: number; lng: number; label?: string }>;
}

export async function createEmbedToken(session: EmbedSession): Promise<string> {
    return new EncryptJWT({ ...session })
        .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
        .setExpirationTime("24h")
        .setIssuedAt()
        .encrypt(SECRET);
}

export async function verifyEmbedToken(token: string): Promise<EmbedSession> {
    const { payload } = await jwtDecrypt(token, SECRET);
    return payload as unknown as EmbedSession;
}

export async function mintTokens(serverToken: string, clientToken: string) {
    const auth = new GebetaAuth({ serverToken });
    return auth.authenticate(clientToken);
}