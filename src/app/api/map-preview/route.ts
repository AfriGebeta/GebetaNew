export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { mintTokens } from "@/lib/map-embed-store";

export async function POST(req: NextRequest) {
    try {
        const { serverToken, clientToken } = await req.json();
        if (!serverToken || !clientToken) {
            return NextResponse.json({ error: "Both tokens required" }, { status: 400 });
        }
        const credentials = await mintTokens(serverToken, clientToken);
        return NextResponse.json(credentials);
    } catch (err) {
        console.error("[map-preview POST]", err);
        return NextResponse.json({ error: "Failed to authenticate" }, { status: 500 });
    }
}