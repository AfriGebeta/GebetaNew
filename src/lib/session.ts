"use client";

export const SESSION_EXPIRED_EVENT = "auth:session-expired";

const AUTH_STORAGE_KEYS = ["isAuthenticated", "currentUser", "authToken"];


export const getTokenExpiry = (token?: string | null): number | null => {
    if (!token || typeof token !== "string") return null;

    const payload = token.split(".")[1];
    if (!payload) return null;

    try {
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = JSON.parse(
            decodeURIComponent(
                atob(normalized)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            )
        );
        return typeof decoded?.exp === "number" ? decoded.exp * 1000 : null;
    } catch {
        return null;
    }
};


export const isTokenExpired = (token?: string | null, skewMs = 5_000): boolean => {
    const expiry = getTokenExpiry(token);
    if (expiry === null) return false;
    return Date.now() >= expiry - skewMs;
};

export const getStoredToken = (): string | null => {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem("currentUser");
        if (!raw) return null;
        return JSON.parse(raw)?.token ?? null;
    } catch {
        return null;
    }
};

export const clearAuthStorage = () => {
    if (typeof window === "undefined") return;
    AUTH_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
};


export const notifySessionExpired = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
};
