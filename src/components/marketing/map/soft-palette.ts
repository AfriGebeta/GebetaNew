import type { Map as MapLibreMap } from "maplibre-gl";

/**
 * A softer look for the demo maps: white roads with light edges on warm land, green parks and pale water, so
 * the routes, pins and coloured place icons carry the picture. Applied in the browser on top of Gebeta's
 * standard style (every layer stays restylable), and never to the tiles demo, which shows the styles as shipped.
 * MapLibre paints with literal colours, so this palette is data rather than CSS tokens.
 */
export const SOFT_PALETTE = {
    land: "#f3f1ed",
    building: "#e7e3dc",
    buildingEdge: "#dcd7cf",
    park: "#d4ebc9",
    water: "#aad3f0",
    road: "#ffffff",
    roadEdge: "#dedad3",
    highway: "#fbe6b3",
    highwayEdge: "#ecd298",
};

type Paint = [property: string, value: unknown];

const RULES: { match: RegExp; paint: (p: typeof SOFT_PALETTE) => Paint[] }[] = [
    { match: /^background$/, paint: (p) => [["background-color", p.land]] },
    { match: /^building(-top)?$/, paint: (p) => [["fill-color", p.building], ["fill-outline-color", p.buildingEdge]] },
    { match: /^(park|landcover-(wood|grass|grass-park))$/, paint: (p) => [["fill-color", p.park]] },
    { match: /^water(-offset)?$/, paint: (p) => [["fill-color", p.water]] },
    { match: /^waterway-/, paint: (p) => [["line-color", p.water]] },
    { match: /^highway-(motorway|trunk)-casing/, paint: (p) => [["line-color", p.highwayEdge]] },
    { match: /^highway-(motorway|trunk)(-ramp|-bridge)?$/, paint: (p) => [["line-color", p.highway]] },
    { match: /^highway-(primary|secondary|tertiary|minor)-casing/, paint: (p) => [["line-color", p.roadEdge]] },
    { match: /^highway-(primary|secondary|tertiary|minor)(-bridge)?$/, paint: (p) => [["line-color", p.road]] },
];

export function applySoftPalette(map: MapLibreMap) {
    if (!map.getLayer("highway-primary")) return;
    for (const layer of map.getStyle().layers ?? []) {
        const rule = RULES.find((r) => r.match.test(layer.id));
        if (!rule) continue;
        for (const [property, value] of rule.paint(SOFT_PALETTE)) {
            try {
                map.setPaintProperty(layer.id, property, value);
            } catch {
                // A layer type without this property (e.g. a fill named like a line): keep its own colour.
            }
        }
    }
}
