import { NextRequest, NextResponse } from "next/server";
import { verifyEmbedToken, mintTokens } from "@/lib/map-embed-store";

export const dynamic = "force-dynamic";

const EXTERNAL_API = "https://api.traffic.gebeta.app"

function errorHtml(message: string, status: number) {
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;background:#e8e0d8;color:#555;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;font-size:14px"><p>${message}</p></body></html>`,
    { status, headers: { "Content-Type": "text/html" } }
  );
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t");
  if (!token) return errorHtml("This embed link is invalid or has expired.", 404);

  let session;
  try { session = await verifyEmbedToken(token); }
  catch { return errorHtml("This embed link is invalid or has expired.", 404); }

  let credentials;
  try { credentials = await mintTokens(session.serverToken, session.clientToken); }
  catch { return errorHtml("Failed to authenticate. Please regenerate the embed.", 500); }

  let markers: { lat: number; lng: number; label?: string; image?: string }[] = [];
  try {
    const placesRes = await fetch(
      `${EXTERNAL_API}/api/external/place?owner=${encodeURIComponent(session.owner)}`,
      { cache: "no-store" }
    );
    if (placesRes.ok) {
      const places = await placesRes.json();
      markers = places
        .filter((p: any) => p.active !== false)
        .map((p: any) => ({
          lat: p.lat,
          lng: p.lng,
          label: p.name ?? undefined,
          image: p.image ?? undefined,
        }));
    }
  } catch {
    // Non-fatal — render map without markers rather than failing the whole embed
  }

  const mapData = JSON.stringify({
    accessToken: credentials.accessToken,
    refreshToken: credentials.refreshToken,
    lat: session.lat,
    lng: session.lng,
    zoom: session.zoom,
    minZoom: session.minZoom ?? 1,
    maxZoom: session.maxZoom ?? 22,
    markers,
    bounds: session.bounds ?? null,
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100%; height:100%; }
    #map { width:100%; height:100vh; }
    .maplibregl-ctrl-bottom-left { display:none !important; }
    .maplibregl-ctrl-attrib { display:none !important; }
    .maplibregl-ctrl-top-right { top:48px !important; }
    #footer {
      position:absolute; bottom:0; left:0; right:0; height:28px;
      background:rgba(255,255,255,0.55); backdrop-filter:blur(8px);
      -webkit-backdrop-filter:blur(8px); display:flex; align-items:center;
      justify-content:space-between; padding:0 10px;
      font-family:Roboto,Arial,sans-serif; font-size:11px; color:#666;
      pointer-events:none; z-index:10; border-top:1px solid rgba(0,0,0,0.07);
    }
    #footer a { pointer-events:all; color:#1a73e8; text-decoration:none; margin-left:8px; }
    #footer a:hover { text-decoration:underline; }
    #open-btn {
      position:absolute; top:10px; right:10px;
      background:rgba(255,255,255,0.55); backdrop-filter:blur(8px);
      -webkit-backdrop-filter:blur(8px); border:none; border-radius:4px;
      box-shadow:0 1px 4px rgba(0,0,0,0.18); padding:6px 12px;
      font-size:12px; font-family:Roboto,Arial,sans-serif; color:#1a73e8;
      cursor:pointer; display:flex; align-items:center; gap:5px;
      z-index:10; transition:background 0.15s;
    }
    #open-btn:hover { background:rgba(255,255,255,0.85); }
    #open-btn svg { width:13px; height:13px; flex-shrink:0; }
    .gebeta-logo { display:none !important; }
  </style>
  <script>window.__MAP_DATA__ = ${mapData};</script>
  <script src="https://tiles.gebeta.app/static/v3/gebeta-maps.umd.js"></script>
</head>
<body>
  <div id="map"></div>

  <button id="open-btn">
    <svg viewBox="0 0 24 24" fill="#1a73e8"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
    View larger map
  </button>

  <div id="footer">
    <span>© Gebeta Maps</span>
    <span>
      <a href="https://gebeta.app/terms" target="_blank">Terms</a>
      <a href="https://maps.gebeta.app" target="_blank">Contribute</a>
    </span>
  </div>

  <script>
    var map;

    document.getElementById('open-btn').addEventListener('click', function () {
      var d = window.__MAP_DATA__;
      var center = map ? map.getCenter() : { lat: d.lat, lng: d.lng };
      var zoom = map ? Math.round(map.getZoom() * 10) / 10 : d.zoom;
      var url = 'https://maps.gebeta.app/?lat=' + center.lat + '&lon=' + center.lng + '&z=' + zoom;
      window.open(url, '_blank');
    });

    window.addEventListener('load', function () {
      var d = window.__MAP_DATA__;

      var gebeta = new GebetaMaps({ auth: { accessToken: d.accessToken, refreshToken: d.refreshToken } });
      map = gebeta.init({
        container: 'map',
        center: [d.lng, d.lat],
        zoom: d.zoom,
        minZoom: d.minZoom,
        maxZoom: d.maxZoom,
        navigationControl: true,
        maxBounds: d.bounds ? [[d.bounds[0], d.bounds[1]], [d.bounds[2], d.bounds[3]]] : undefined,
      });

      map.on('load', function () {
        (d.markers || []).forEach(function (m) {
          var el = document.createElement('div');

          if (m.image) {
            el.style.cssText = [
              'width:36px', 'height:36px',
              'background-image:url(' + m.image + ')',
              'background-size:contain',
              'background-repeat:no-repeat',
              'background-position:center bottom',
              'cursor:pointer',
            ].join(';');
          } else {
            el.style.cssText = [
              'width:40px', 'height:40px',
              'background-image:url(https://upload.wikimedia.org/wikipedia/commons/f/f2/678111-map-marker-512.png)',
              'background-size:contain', 'background-repeat:no-repeat',
              'background-position:center bottom', 'cursor:pointer',
              'filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            ].join(';');
          }

          var marker = new maplibregl.Marker({ element: el, anchor: m.image ? 'center' : 'bottom' })
            .setLngLat([m.lng, m.lat]);

          if (m.label) {
            var popup = new maplibregl.Popup({ offset: 25, closeButton: true })
              .setHTML('<div style="font-family:Roboto,Arial,sans-serif;font-size:13px;font-weight:600;color:#333;padding:2px 4px;">' + m.label + '</div>');
            marker.setPopup(popup);
          }
          marker.addTo(map);
        });
      });
    });
  </script>
</body>
</html>`;

  return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html" } });
}