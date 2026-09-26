export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

const PLAY_STORE_LINK = "https://play.google.com/store/apps/details?id=co.gebeta.apps.android.map";
const APP_STORE_LINK = "https://apps.apple.com/us/app/gebeta-maps/id6793868587";

function detectPlatform(userAgent: string) {
    if (/android/i.test(userAgent)) {
        return "android";
    }
    if (/iPad|iPhone|iPod/.test(userAgent) || /Macintosh/.test(userAgent)) {
        return "ios";
    }

    return "other";
}

export async function GET(req: NextRequest) {
    const platform = detectPlatform(req.headers.get("user-agent") || "");
    const link = platform === "ios" ? APP_STORE_LINK : PLAY_STORE_LINK;

    return NextResponse.redirect(link, { status: 302 });
}
