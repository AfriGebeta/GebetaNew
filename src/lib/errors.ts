import { AxiosError } from "axios";

interface BackendErrorBody {
    error?: {
        message?: string;
        code?: string;
        additional?: unknown;
    };
    message?: string;
    msg?: string;
}

/**
 * Extracts a human-readable message from an API error.
 *
 * The backend's real envelope is `{ "error": { "message", "code", "additional" } }`
 * (GoServer/auth gateway). When the top-level message is a generic one like
 * "Data validation failed!", the real per-field reason lives in
 * `additional.<section>.<field>` — GoServer's `FailedValidations` type is
 * `map[string]map[string][]string`, e.g. `additional.body.token`,
 * `additional.body.scopes`, `additional.query.page`, `additional.data.scope`
 * — the section ("body"/"query"/"data") and field name vary per handler, so
 * there's no single fixed key to read; every string found anywhere under
 * `additional` is collected instead. Falls back to a couple of other shapes
 * some endpoints use (`data.message`/`data.msg`), then to the JS error's own
 * message, then to `fallback`.
 */
export function getErrorMessage(
    error: unknown,
    fallback = "Something went wrong. Please try again."
): string {
    const data = (error as AxiosError<BackendErrorBody>)?.response?.data;

    if (data) {
        const validationMessage = extractValidationMessage(data.error?.additional);
        const candidates = [validationMessage, data.error?.message, data.message, data.msg];
        const found = candidates.find((m) => typeof m === "string" && m.trim().length > 0);
        if (found) return found;
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}

function extractValidationMessage(additional: unknown): string | undefined {
    const messages: string[] = [];

    // Walks any shape (array of strings, nested field maps, {field,message}
    // objects, ...) and collects every string leaf it finds, since different
    // backends/handlers nest their per-field messages differently and there's
    // no single key name that covers them all.
    const collect = (value: unknown) => {
        if (typeof value === "string") {
            if (value.trim().length > 0) messages.push(value);
        } else if (Array.isArray(value)) {
            value.forEach(collect);
        } else if (value && typeof value === "object") {
            Object.values(value as Record<string, unknown>).forEach(collect);
        }
    };

    collect(additional);
    return messages.length > 0 ? messages.join(", ") : undefined;
}
