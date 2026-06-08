import { NextRequest, NextResponse } from "next/server";
import { verifyEmbedToken, mintTokens } from "@/lib/map-embed-store";

export const dynamic = "force-dynamic";

function errorHtml(message: string, status: number) {
    return new NextResponse(
        `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;background:#111;color:#aaa;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><p>${message}</p></body></html>`,
        { status, headers: { "Content-Type": "text/html" } }
    );
}

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("t");
    if (!token) return errorHtml("This embed link is invalid or has expired.", 404);

    let session;
    try {
        session = await verifyEmbedToken(token);
    } catch {
        return errorHtml("This embed link is invalid or has expired.", 404);
    }

    let credentials;
    try {
        credentials = await mintTokens(session.serverToken, session.clientToken);
    } catch {
        return errorHtml("Failed to authenticate. Please check your tokens and regenerate the embed.", 500);
    }

    const mapData = JSON.stringify({
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        lat: session.lat,
        lng: session.lng,
        zoom: session.zoom,
        markers: session.markers,
    });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>* { margin:0; padding:0; box-sizing:border-box; } html,body { width:100%; height:100%; } #map { width:100%; height:100vh; }</style>
  <script>window.__MAP_DATA__ = ${mapData};</script>
  <script src="https://tiles.gebeta.app/static/v3/gebeta-maps.umd.js"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    window.addEventListener('load', function () {
      var d = window.__MAP_DATA__;
      var gebetaMap = new GebetaMaps({ auth: { accessToken: d.accessToken, refreshToken: d.refreshToken } });
      var map = gebetaMap.init({ container: 'map', center: [d.lng, d.lat], zoom: d.zoom, navigationControl: true });
      map.on('load', function () {
        (d.markers || []).forEach(function (m) {
          var el = document.createElement('div');
          el.style.cssText = 'width:28px;height:28px;border-radius:50% 50% 50% 0;background:#FFA500;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);';
          var marker = new maplibregl.Marker({ element: el }).setLngLat([m.lng, m.lat]);
          if (m.label) marker.setPopup(new maplibregl.Popup().setText(m.label));
          marker.addTo(map);
        });
      });
    });
  </script>
</body>
</html>`;

    return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html" },
    });
}