/**
 * Reads design tokens at runtime for code that can't use CSS classes (MapLibre paint, canvas, injected HTML).
 * Tokens hold bare HSL channels (`39 100% 50%`), as defined in globals.css.
 */
export function tokenColor(name: `--${string}`, alpha = 1) {
    if (typeof document === "undefined") return "transparent";
    const [h, s, l] = getComputedStyle(document.documentElement).getPropertyValue(name).trim().split(/\s+/);
    return `hsla(${h}, ${s}, ${l}, ${alpha})`;
}

/** Resolves `hsl(var(--token))` / `hsl(var(--token) / a)` strings; other colours pass through. */
export function resolveColor(color: string) {
    const match = color.match(/var\((--[\w-]+)\)(?:\s*\/\s*([\d.]+))?/);
    return match ? tokenColor(match[1] as `--${string}`, match[2] ? Number(match[2]) : 1) : color;
}
