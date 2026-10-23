export type Credit = {
    id: string;
    bundle_id?: string;
    paid_amount?: string;
    calls?: number[];
    call_caps?: number[];
    included_call_type?: string[];
    expiration?: string;
    is_freeemium?: boolean;
};

export type PlanKind = "paid" | "payg" | "free" | "none";

export type CurrentPlan = {
    kind: PlanKind;
    credit: Credit | null;
};

export type CreditUsage = {
    callType: string;
    used: number;
    cap: number;
    remaining: number;
    percent: number;
};

export const PLAN_LABEL: Record<PlanKind, string> = {
    paid: "Paid",
    payg: "Pay as you go",
    free: "Free",
    none: "No plan",
};

export function parseExpiration(expiration?: string) {
    return expiration ? new Date(`${expiration}T23:59:59`) : null;
}

export function isCreditActive(credit: Credit, now = new Date()) {
    const expiresAt = parseExpiration(credit.expiration);
    return !expiresAt || expiresAt >= now;
}

export function isPaidCredit(credit: Credit) {
    return !credit.is_freeemium || Number(credit.paid_amount) > 0;
}

function latestExpiring(credits: Credit[]) {
    return [...credits].sort(
        (a, b) => (parseExpiration(b.expiration)?.getTime() ?? Infinity) - (parseExpiration(a.expiration)?.getTime() ?? Infinity),
    )[0] ?? null;
}

export function getCurrentPlan(user?: { credits?: Credit[]; purchased_date?: string | null } | null): CurrentPlan {
    const active = (user?.credits ?? []).filter((credit) => isCreditActive(credit));
    const paid = latestExpiring(active.filter(isPaidCredit));
    const freemium = latestExpiring(active.filter((credit) => !isPaidCredit(credit)));

    if (user?.purchased_date) return { kind: "payg", credit: paid ?? freemium };
    if (paid) return { kind: "paid", credit: paid };
    if (freemium) return { kind: "free", credit: freemium };
    return { kind: "none", credit: null };
}

export function getCreditUsage(credit: Credit): CreditUsage[] {
    return (credit.included_call_type ?? []).map((callType, index) => {
        const cap = Number(credit.call_caps?.[index]) || 0;
        const used = Math.min(cap, Number(credit.calls?.[index]) || 0);
        return {
            callType,
            used,
            cap,
            remaining: cap - used,
            percent: cap > 0 ? (used / cap) * 100 : 0,
        };
    });
}

export function formatCallType(callType: string) {
    // Short names are acronyms (ONM, TSS) the rest read as words.
    return callType.length <= 3 ? callType : callType.charAt(0) + callType.slice(1).toLowerCase();
}
