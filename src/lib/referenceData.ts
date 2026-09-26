export const EXCLUDED_TOKEN_SCOPES = ["AUTH", "REFRESH", "FEATURE_ALL"] as const;

export const DEFAULT_TOKEN_SCOPES = [
    "DIRECTION",
    "GEOCODING",
    "TILE",
    "MATRIX",
    "ONM",
    "TSS",
] as const;

export function filterSelectableScopes(scopes: string[]): string[] {
    return scopes.filter((scope) => !EXCLUDED_TOKEN_SCOPES.includes(scope as (typeof EXCLUDED_TOKEN_SCOPES)[number]));
}

export function formatScopeLabel(scope: string): string {
    return scope
        .split("_")
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join(" ");
}

export function getDefaultSelectedScopes(allowedScopes: string[]): string[] {
    // const preferred = DEFAULT_TOKEN_SCOPES.filter((scope) => allowedScopes.includes(scope));
    // return preferred.length > 0 ? [...preferred] : [...allowedScopes];

    return allowedScopes;

}
