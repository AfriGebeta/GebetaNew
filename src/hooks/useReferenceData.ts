import { useEffect, useState } from "react";
import { getReferenceData } from "@/service/apis";
import { getDefaultSelectedScopes } from "@/lib/referenceData";

export function useReferenceData() {
    const [allowedScopes, setAllowedScopes] = useState<string[]>([]);
    const [tokenTypes, setTokenTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const result = await getReferenceData();
            if (cancelled) return;

            if (result.success) {
                setAllowedScopes(result.allowedScopes);
                setTokenTypes(result.tokenTypes);
                setError(null);
            } else {
                setError(result.message || "Failed to load reference data");
            }
            setLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return {
        allowedScopes,
        tokenTypes,
        loading,
        error,
        getDefaultSelectedScopes: () => getDefaultSelectedScopes(allowedScopes),
    };
}
