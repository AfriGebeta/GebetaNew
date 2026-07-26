import axios from "axios";
import { isTokenExpired, notifySessionExpired } from "@/lib/session";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

const CREDENTIAL_CHECK_PATHS = [
    "/auth/",
    "/domain",
];

const isCredentialCheck = (url?: string) =>
    !!url && CREDENTIAL_CHECK_PATHS.some((path) => url.split("?")[0].includes(path));

apiClient.interceptors.request.use((config) => {
    const header = config.headers?.Authorization ?? config.headers?.authorization;
    const token = typeof header === "string" ? header.replace(/^Bearer\s+/i, "") : null;

    if (!isCredentialCheck(config.url) && isTokenExpired(token)) {
        notifySessionExpired();
        return Promise.reject(new axios.Cancel("Session expired"));
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if ((status === 401 || status === 403) && !isCredentialCheck(error.config?.url)) {
            notifySessionExpired();
        }
        return Promise.reject(error);
    }
);
