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

// Display-only overrides for scope labels shown in the UI. The underlying scope value
// (e.g. "VRP") is unchanged everywhere else - DB enum, JWT claims, backend auth checks -
// this only affects what a user sees in the scope picker.
const SCOPE_LABEL_OVERRIDES: Record<string, string> = {
    VRP: "Fleet Optimization",
};

export function formatScopeLabel(scope: string): string {
    if (SCOPE_LABEL_OVERRIDES[scope]) return SCOPE_LABEL_OVERRIDES[scope];

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

// `referenceScopes` is the global list of all scope types the platform knows about
// (from /v1/reference-data); `userAllowedScopes` is the subset actually granted to
// this account (from /user/me's `allowed_scopes`). The backend rejects any token
// creation request for a scope outside the user's own grant, so the picker must be
// restricted to the intersection rather than the full reference list.
export function getGrantedScopes(referenceScopes: string[], userAllowedScopes?: string[] | null): string[] {
    if (!userAllowedScopes || userAllowedScopes.length === 0) return [];
    return referenceScopes.filter((scope) => userAllowedScopes.includes(scope));
}
