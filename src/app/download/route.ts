export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { initDownloadTables, recordClick } from "@/lib/downloads/db";

const PLAY_STORE_LINK = "https://play.google.com/store/apps/details?id=co.gebeta.apps.android.map";
const APP_STORE_LINK = "https://apps.apple.com/us/app/gebeta-maps/id6793868587";

const BOT_RE =
    /bot|crawl|spider|slurp|facebookexternalhit|bingpreview|linkedinbot|whatsapp|telegram|discord|twitterbot|embedly|preview|headless|curl|wget|python-requests|axios|go-http-client|monitoring|uptime/i;

function detectPlatform(userAgent: string) {
    if (/android/i.test(userAgent)) {
        return "android";
    }
    if (/iPad|iPhone|iPod/.test(userAgent) || /Macintosh/.test(userAgent)) {
        return "ios";
    }

    return "other";
}

// Ads can't always use full utm_* names, so short aliases are accepted too.
function pick(params: URLSearchParams, keys: string[]) {
    for (const key of keys) {
        const value = params.get(key);
        if (value) return value.slice(0, 200);
    }
    return "";
}

function referrerHost(referrer: string) {
    try {
        return new URL(referrer).hostname.replace(/^www\./, "");
    } catch {
        return "";
    }
}

async function track(req: NextRequest, platform: string) {
    const params = req.nextUrl.searchParams;
    const userAgent = req.headers.get("user-agent") || "";
    const referrer = req.headers.get("referer") || "";
    const source = pick(params, ["utm_source", "source", "src", "ref", "s"]) || referrerHost(referrer) || "direct";

    await initDownloadTables();
    await recordClick({
        platform,
        source: source.toLowerCase(),
        medium: pick(params, ["utm_medium", "medium", "m"]).toLowerCase(),
        campaign: pick(params, ["utm_campaign", "campaign", "c"]).toLowerCase(),
        content: pick(params, ["utm_content", "content", "ad"]).toLowerCase(),
        referrer: referrer.slice(0, 500),
        landedOn: req.nextUrl.search.slice(0, 500),
        userAgent: userAgent.slice(0, 500),
        country: req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || "",
        ip: (req.headers.get("x-forwarded-for") || "").split(",")[0].trim(),
        isBot: BOT_RE.test(userAgent) || !userAgent,
    });
}

export async function GET(req: NextRequest) {
    const platform = detectPlatform(req.headers.get("user-agent") || "");
    const link = platform === "ios" ? APP_STORE_LINK : PLAY_STORE_LINK;

    // Never let an analytics failure block the redirect.
    try {
        await track(req, platform);
    } catch (err) {
        console.error("[download] failed to record click", err);
    }

    return NextResponse.redirect(link, { status: 302 });
}
