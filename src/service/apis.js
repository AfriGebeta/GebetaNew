import { apiClient } from "@/service/apiClient";
import { getErrorMessage } from "@/lib/errors";


export const getUser = async (apiToken) => {
    try {
        const { data } = await apiClient.get(
            `/user/me`,
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`
                }
            }
        );
        return data.user;
    } catch (error) {
        return error;
    }
};

export const updateUser = async (apiToken, { username, phone, allow_abuse_detection, companyname, lastname }) => {
    try {
        const { data } = await apiClient.patch(
            `/user/`,
            {
                username,
                phone,
                allow_abuse_detection,
                companyname,
                lastname
            },
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return { success: true, data: data.data, message: data.data };
    } catch (error) {
        console.error('Update user error:', error.message);
        return { success: false, message: getErrorMessage(error, 'Failed to update user') };
    }
};

export const setToken = async ({ apiToken, userId, scopes, identifierName }) => {
    try {
        const scopesString = Array.isArray(scopes)
            ? scopes.join(',')
            : scopes || "DIRECTION,GEOCODING,TILE,MATRIX,ONM,TSS";

        const { data } = await apiClient.patch(
            `/user/updatetoken`,
            {
                userId,
                scopes: scopesString,
                identifierName: identifierName || "Unnamed Token"
            },
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            }
        );

        return {
            success: true,
            data: data.data,
            message: data.msg || 'Token created successfully',
        };
    } catch (error) {
        const errorData = error.response?.data?.error;

        return {
            success: false,
            message: getErrorMessage(error, 'Failed to create token'),
            error: errorData,
        };
    }
};

export const revokeToken = async (apiToken, token) => {
    try {
        console.log('revoking token:', {
            endpoint: `/user/revoke-token?token=${token.substring(0, 20)}...`,
            authToken: apiToken.substring(0, 20) + '...'
        });

        const { data } = await apiClient.patch(
            `/user/revoke-token?token=${token}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`
                }
            }
        )

        console.log('revoke successful:', data);

        return {
            success: true,
            data: data.data,
        }
    } catch (error) {
        console.error('revoke error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });

        return {
            success: false,
            message: getErrorMessage(error, 'Failed to revoke token'),
            error: error.response?.data
        }
    }
}

export const getMatrix = async (apiToken) => {
    const { data } = await apiClient.get(`/usage/matrix`, {
        headers: {
            Authorization: `Bearer ${apiToken}`,
        },
    });

    return data.data
};

export const getUserUsage = async (
    startDate,
    endDate,
    apiToken) => {
    try {
        const { data } = await apiClient.get(`/usage/matrix?startDate=${startDate}&endDate=${endDate}`, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            }
        })

        return data.data

    } catch (error) {
        return error
    }
}

export const getUserUsageForGraph = async (
    selected,
    startDate,
    endDate,
    apiToken
) => {
    try {
        const data = await apiClient.get(
            `/usage/graph?type=${selected}&startDate=${startDate}&endDate=${endDate}`,
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            }
        );
        return { error: null, data };
    } catch (error) {
        return error;
    }
};


export const verifyPayment = async (apiToken, id) => {
    try {
        const response = await apiClient.get(`/payment/verify/${id}`, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        return error;
    }
}

export const getAllBilling = async (apiToken, page, limit) => {
    try {
        const response = await apiClient.get("/sales/get-all", {
            params: {
                page: page,
                limit: limit,
            },
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        });
        return { billing: response.data.data.sales || [], count: response.data.data.count };
    } catch (error) {
        return error;
    }
};

export const buyCredit = async (apiToken, id) => {
    try {
        const response = await apiClient.post(`/payment/credit`, {
            credit_bundle_id: id,
            payment_for: "credit",
            payment_method: "CHAPA"
        }, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json",
            },
        });
        return { data: response.data };
    } catch (error) {
        return error
    }
};

export const getAllCredits = async ({ page, limit }) => {
    try {
        const data = await apiClient.get(
            `/credit-bundle?page=${page}&limit=${limit}`,
        );
        return data.data.data;
    } catch (error) {
        return error;
    }
};

export const claimFreemium = async (apiToken) => {
    try {
        const data = await apiClient.post(
            `/payment/freemium/credit`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return data?.data
    } catch (error) {
        return error?.response?.data?.error?.additional?.claim?.[0] || getErrorMessage(error, 'Unable to claim freemium credit');
    }
}

// allowed IP restrictions
export const getAllowedIps = async (apiToken, page = 1, limit = 50) => {
    if (!apiToken) return { domains: [], count: 0 };
    try {
        const { data } = await apiClient.get(`/domain/?page=${page}&limit=${limit}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        const payload = data?.data ?? data;
        const list = payload?.Domains ?? payload?.domains ?? [];
        const count = payload?.count ?? payload?.Count ?? (Array.isArray(list) ? list.length : 0);

        return {
            domains: Array.isArray(list) ? list : [],
            count: typeof count === "number" ? count : 0,
        };
    } catch (error) {
        return { domains: [], count: 0 };
    }
};

export const createAllowedIp = async (apiToken, { ipAddress, apiKey, description }) => {
    try {
        const body = { ipAddress, apiKey };
        if (description?.trim()) {
            body.description = description.trim();
        }
        await apiClient.post('/domain', body, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: getErrorMessage(error, 'Failed to add allowed IP') };
    }
};

export const deleteAllowedIp = async (apiToken, id) => {
    try {
        await apiClient.delete(`/domain?id=${id}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: getErrorMessage(error, 'Failed to remove allowed IP') };
    }
};

export const updateAllowedIp = async (apiToken, { id, ipAddress, apiKey, description }) => {
    try {
        const body = { id, ipAddress, apiKey };
        if (description?.trim()) {
            body.description = description.trim();
        }
        await apiClient.patch('/domain', body, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: getErrorMessage(error, 'Failed to update allowed IP') };
    }
};

//api usage quota
export const getUsageQuotas = async (apiToken, page = 1, limit = 20) => {
    try {
        const { data } = await apiClient.get(`/apicap/quota?limit=${limit}&page=${page}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return data.data?.quotas || [];
    } catch (error) {
        return [];
    }
};

export const createUsageQuota = async (apiToken, { call_type, max_calls, duration, next_reset_at }) => {
    try {
        const body = { max_calls, duration };
        if (call_type) body.call_type = call_type;
        if (next_reset_at) body.next_reset_at = next_reset_at;
        const { data } = await apiClient.post('/apicap/quota', body, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        return { success: false, message: getErrorMessage(error, 'Failed to create quota') };
    }
};

export const updateUsageQuota = async (apiToken, { id, max_calls }) => {
    try {
        const { data } = await apiClient.patch('/apicap/quota', { id, max_calls }, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        return { success: false, message: getErrorMessage(error, 'Failed to update quota') };
    }
};

export const deleteUsageQuota = async (apiToken, id) => {
    try {
        await apiClient.delete(`/apicap/quota?id=${id}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: getErrorMessage(error, 'Failed to delete quota') };
    }
};

// billing Cap
export const getBillingCaps = async (apiToken, page = 1, limit = 20) => {
    try {
        const { data } = await apiClient.get(`/billing/cap?limit=${limit}&page=${page}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        return { success: false, message: getErrorMessage(error, 'Failed to fetch billing caps') };
    }
};

export const createBillingCap = async (apiToken, capAmount) => {
    try {
        const { data } = await apiClient.post('/billing/cap', { cap_amount: capAmount }, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        return { success: false, message: getErrorMessage(error, 'Failed to set billing cap') };
    }
};

export const updateBillingCap = async (apiToken, { id, max_calls }) => {
    try {
        const { data } = await apiClient.patch('/billing/cap', { id, max_calls }, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        return { success: false, message: getErrorMessage(error, 'Failed to update billing cap') };
    }
};

export const deleteBillingCap = async (apiToken, id) => {
    try {
        await apiClient.delete(`/billing/cap?id=${id}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: getErrorMessage(error, 'Failed to delete billing cap') };
    }
};

export const getServiceAccounts = async (apiToken, userId) => {
    try {
        const { data } = await apiClient.get(`/v1/service-accounts/org/${userId}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return data.data || [];
    } catch (error) {
        console.error('Failed to fetch service accounts:', error);
        return [];
    }
};

export const createServiceAccount = async ({ apiToken, description, scopes, isAdmin }) => {
    try {
        const { data } = await apiClient.post('/v1/service-accounts', {
            platform: "WEB",
            isAdmin: isAdmin || false,
            description: description || "",
            scopes: scopes
        }, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        return { success: false, message: getErrorMessage(error, 'Failed to create service account') };
    }
};

export const deleteServiceAccount = async (apiToken, id) => {
    try {
        await apiClient.delete(`/v1/service-accounts/${id}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: getErrorMessage(error, 'Failed to delete service account') };
    }
};

// Access Blocks
export const getAccessBlocks = async (apiToken) => {
    try {
        const { data } = await apiClient.get('/access-blocks', {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        console.log('Raw API response:', data);
        console.log('Blocks array:', data.data?.blocks);
        return data.data?.blocks || [];
    } catch (error) {
        console.error('Failed to fetch access blocks:', error);
        return [];
    }
};

export const createAccessBlock = async (apiToken, { type, value, reason }) => {
    try {
        const { data } = await apiClient.post('/access-blocks', {
            type,
            value,
            reason
        }, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            },
        });
        return { success: true, data: data.data };
    } catch (error) {
        console.error('Create access block error:', error.response?.data);
        return {
            success: false,
            message: getErrorMessage(error, 'Failed to create access block'),
            details: error.response?.data
        };
    }
};

export const deleteAccessBlock = async (apiToken, id) => {
    try {
        await apiClient.delete(`/access-blocks/${id}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: getErrorMessage(error, 'Failed to delete access block') };
    }
};

export const getRecentCalls = async (apiToken, { startDate, endDate, page = 1, pageSize = 20, type, ipAddress, deviceId }) => {
    try {
        const params = new URLSearchParams({
            startDate,
            endDate,
            page: String(page),
            limit: String(pageSize),
        });

        if (type) params.append('type', type);
        if (ipAddress) params.append('ipAddress', ipAddress);
        if (deviceId) params.append('deviceId', deviceId);

        const { data } = await apiClient.get(`/usage/recent-calls?${params.toString()}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return {
            success: true,
            data: data.data || [],
            page: data.page || page,
            limit: data.limit || pageSize,
            totalCount: data.total_count || 0
        };
    } catch (error) {
        console.error('Failed to fetch recent calls:', error);
        return {
            success: false,
            data: [],
            page: 1,
            limit: pageSize,
            totalCount: 0,
            message: getErrorMessage(error, 'Failed to fetch recent calls')
        };
    }
};

export const getReferenceData = async () => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8085/api";
        const response = await fetch(`${baseUrl}/v1/reference-data`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return { success: false, message: "Failed to load reference data", tokenTypes: [], allowedScopes: [] };
        }

        const data = await response.json();
        const excluded = new Set(["AUTH", "REFRESH", "FEATURE_ALL"]);
        const allowedScopes = (data.allowed_token_scopes || []).filter((scope) => !excluded.has(scope));

        return {
            success: true,
            tokenTypes: data.token_types || [],
            allowedScopes,
        };
    } catch (error) {
        console.error("Failed to fetch reference data:", error);
        return {
            success: false,
            message: "Failed to load reference data",
            tokenTypes: [],
            allowedScopes: [],
        };
    }
};
