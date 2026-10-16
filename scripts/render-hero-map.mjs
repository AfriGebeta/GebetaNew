#!/usr/bin/env node
/**
 * Renders the landing hero's background once: a street-level snapshot of Megenagna, Addis Ababa, on Gebeta's
 * standard tiles with its labels and place icons, saved to public/images/hero-map.webp.
 *
 *   node scripts/render-hero-map.mjs        (Node 22+, Chrome installed, GEBETA_TOKEN in the environment or .env)
 *
 * The key stays in this process: the headless page loads tiles through a local proxy that adds it.
 * Re-run after changing the frame below, or when the map style changes.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const TILES = "https://tiles.gebeta.app";
const STYLE = `${TILES}/styles/standard/style.json`;

/** The frame, in CSS pixels. The hero scales it with `object-fit: cover`, so the middle is what always shows. */
const FRAME = { width: 1800, height: 1000, center: [38.8005, 9.0198], zoom: 15.4 };
const PIXEL_RATIO = 2;
const WEBP_QUALITY = 55;
/** Layers left out: administrative boundaries, which only clutter a street-level view. */
const HIDDEN = (layer) => /boundary|admin/.test(layer.id);

const OUT_IMAGE = join(root, "public/images/hero-map.webp");

function readKey() {
    if (process.env.GEBETA_TOKEN) return process.env.GEBETA_TOKEN.trim();
    const line = readFileSync(join(root, ".env"), "utf8").split("\n").find((l) => l.startsWith("GEBETA_TOKEN="));
    if (!line) throw new Error("GEBETA_TOKEN is not set (environment or .env)");
    return line.slice("GEBETA_TOKEN=".length).trim().replace(/^["']|["']$/g, "");
}
const KEY = readKey();

/* ─── local server: the page, maplibre, and a key-adding tile proxy ─────────── */

const page = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body,#map{margin:0;width:100%;height:100%;background:#fff}</style></head>
<body><div id="map"></div><script src="/maplibre-gl.js"></script><script>
const proxied = (url) => url.startsWith(${JSON.stringify(TILES)}) ? location.origin + "/proxy" + url.slice(${TILES.length}) : url;
window.render = (frame, hidden) => new Promise(async (resolve, reject) => {
    const style = await (await fetch(proxied(${JSON.stringify(STYLE)}))).json();
    style.layers = style.layers.filter((l) => !hidden.includes(l.id));
    const map = new maplibregl.Map({
        container: "map", style, center: frame.center, zoom: frame.zoom, interactive: false,
        attributionControl: false, fadeDuration: 0, preserveDrawingBuffer: true,
        transformRequest: (url) => ({ url: proxied(url) }),
    });
    map.on("error", (e) => reject(String(e.error && e.error.message)));
    map.once("idle", () => resolve());
});
</script></body></html>`;

const server = createServer(async (req, res) => {
    try {
        if (req.url === "/") return res.writeHead(200, { "content-type": "text/html" }).end(page);
        if (req.url === "/maplibre-gl.js") {
            const js = readFileSync(join(root, "node_modules/maplibre-gl/dist/maplibre-gl.js"));
            return res.writeHead(200, { "content-type": "text/javascript" }).end(js);
        }
        if (req.url.startsWith("/proxy/")) {
            const path = req.url.slice("/proxy".length).split("?")[0];
            const upstream = await fetch(`${TILES}${path}?apiKey=${encodeURIComponent(KEY)}`);
            const body = Buffer.from(await upstream.arrayBuffer());
            return res.writeHead(upstream.status, { "content-type": upstream.headers.get("content-type") ?? "" }).end(body);
        }
        res.writeHead(404).end();
    } catch (e) {
        res.writeHead(502).end(String(e));
    }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;

/* ─── headless Chrome over the DevTools protocol ────────────────────────────── */

const chromePath = [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((p) => p && existsSync(p));
if (!chromePath) throw new Error("Chrome not found; set CHROME_PATH");
const profile = mkdtempSync(join(tmpdir(), "hero-map-"));
const chrome = spawn(chromePath, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
    "--no-first-run", "--hide-scrollbars", "--enable-unsafe-swiftshader", "--use-angle=swiftshader", "about:blank"],
    { stdio: ["ignore", "ignore", "pipe"] });
const wsUrl = await new Promise((resolve, reject) => {
    let log = "";
    chrome.stderr.on("data", (d) => {
        log += d;
        const m = log.match(/DevTools listening on (ws:\/\/\S+)/);
        if (m) resolve(m[1]);
    });
    chrome.on("exit", () => reject(new Error(`Chrome exited:\n${log.slice(-500)}`)));
});

const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let nextId = 1;
const pending = new Map();
ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (!msg.id || !pending.has(msg.id)) return;
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
};
const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params, ...(sessionId && { sessionId }) }));
    });

try {
    const { targetId } = await send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
    const cdp = (method, params) => send(method, params, sessionId);
    await cdp("Emulation.setDeviceMetricsOverride", { width: FRAME.width, height: FRAME.height, deviceScaleFactor: PIXEL_RATIO, mobile: false });
    await cdp("Page.navigate", { url: origin });
    await new Promise((r) => setTimeout(r, 1500));

    const style = await (await fetch(`${TILES}/styles/standard/style.json?apiKey=${encodeURIComponent(KEY)}`)).json();
    const hidden = style.layers.filter(HIDDEN).map((l) => l.id);
    const evaluated = await cdp("Runtime.evaluate", {
        expression: `render(${JSON.stringify(FRAME)}, ${JSON.stringify(hidden)})`,
        awaitPromise: true,
        returnByValue: true,
    });
    if (evaluated.exceptionDetails) throw new Error(`render failed: ${JSON.stringify(evaluated.exceptionDetails.exception?.value ?? evaluated.exceptionDetails.text)}`);

    const { data } = await cdp("Page.captureScreenshot", { format: "png" });
    await sharp(Buffer.from(data, "base64")).webp({ quality: WEBP_QUALITY }).toFile(OUT_IMAGE);

    console.log(`wrote ${OUT_IMAGE}`);
} finally {
    await send("Browser.close").catch(() => undefined);
    ws.close();
    server.close();
    // Chrome's helper processes can still be writing to the temporary profile; leaving it behind is harmless.
    await new Promise((r) => setTimeout(r, 500));
    try {
        rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch {}
}
