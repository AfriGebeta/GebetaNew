import { apiClient } from "@/service/apiClient";


export const getUser = async (apiToken) => {
    try {
        const data = await apiClient.get(
            `/user/me`,
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`
                }
            }
        );
        return data.data.data;
    } catch (error) {
        return error;
    }
};

export const setToken = async ({apiToken, userId, scopes, identifierName }) => {
    try {
        const scopesString = Array.isArray(scopes)
            ? scopes.join(',')
            : scopes || "DIRECTION,GEOCODING,TILE,MATRIX,ONM,TSS";

        const {data} = await apiClient.patch(
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
        let errorMessage = 'Failed to create token';

        if (errorData?.code === 'HE00008' && errorData?.additional?.body?.scopes) {
            const invalidScope = errorData.additional.body.scopes[1];
            errorMessage = `You don't have permission to use ${invalidScope}`;
        } else if (errorData?.message) {
            errorMessage = errorData.message;
        }

        return {
            success: false,
            message: errorMessage,
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

        const {data} = await apiClient.patch(
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
            message: error.response?.data?.message || error.response?.data?.error?.message || 'Failed to revoke token',
            error: error.response?.data
        }
    }
}

export const getMatrix = async (apiToken) => {
    const {data} = await apiClient.get(`/usage/matrix`, {
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
        const {data} = await apiClient.get(`/usage/matrix?startDate=${startDate}&endDate=${endDate}`, {
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
        return {error: null, data};
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
        return {billing: response.data.data.places || [], count: response.data.data.count};
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
        return {data: response.data};
    } catch (error) {
        return error
    }
};

export const getAllCredits = async ({page, limit}) => {
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
        return error?.response?.data?.error?.additional.claim?.[0];
    }
}

//dns lock
export const getDomainLocks = async (apiToken, page = 0, limit = 10) => {
    if (!apiToken) return [];
    try {
        const { data } = await apiClient.get(`/domain/?page=${page}&limit=${limit}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        const payload = data?.data ?? data;
        const list = payload?.Domains ?? payload?.domains;
        return Array.isArray(list) ? list : [];
    } catch (error) {
        return [];
    }
};

export const createDomainLock = async (apiToken, { userId, domain }) => {
    try {
        const { data } = await apiClient.post('/domain', { userId, domain, apiKey: null }, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        const res = error.response?.data;
        const message = res?.message || res?.error?.message || res?.msg || res?.error || 'Failed to add domain lock';
        return { success: false, message: typeof message === 'string' ? message : 'Failed to add domain lock' };
    }
};

export const deleteDomainLock = async (apiToken, id) => {
    try {
        await apiClient.delete(`/domain?id=${id}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true };
    } catch (error) {
        const res = error.response?.data;
        const message = res?.message || res?.error?.message || res?.msg || 'Failed to delete domain lock';
        return { success: false, message: typeof message === 'string' ? message : 'Failed to delete domain lock' };
    }
};

export const updateDomainLock = async (apiToken, { id, domain }) => {
    try {
        const { data } = await apiClient.patch('/domain', { id, domain }, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to update domain lock' };
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
        const res = error.response?.data;
        const message = res?.message || res?.error?.message || res?.msg || res?.error || 'Failed to create quota';
        return { success: false, message: typeof message === 'string' ? message : 'Failed to create quota' };
    }
};

export const updateUsageQuota = async (apiToken, { id, max_calls }) => {
    try {
        const { data } = await apiClient.patch('/apicap/quota', { id, max_calls }, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        const res = error.response?.data;
        const message = res?.message || res?.error?.message || res?.msg || res?.error || 'Failed to update quota';
        return { success: false, message: typeof message === 'string' ? message : 'Failed to update quota' };
    }
};

export const deleteUsageQuota = async (apiToken, id) => {
    try {
        await apiClient.delete(`/apicap/quota?id=${id}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true };
    } catch (error) {
        const res = error.response?.data;
        const message = res?.message || res?.error?.message || res?.msg || res?.error || 'Failed to delete quota';
        return { success: false, message: typeof message === 'string' ? message : 'Failed to delete quota' };
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
        return { success: false, message: error.response?.data?.message || 'Failed to fetch billing caps' };
    }
};

export const createBillingCap = async (apiToken, capAmount) => {
    try {
        const { data } = await apiClient.post('/billing/cap', { cap_amount: capAmount }, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to set billing cap' };
    }
};

export const updateBillingCap = async (apiToken, { id, max_calls }) => {
    try {
        const { data } = await apiClient.patch('/billing/cap', { id, max_calls }, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to update billing cap' };
    }
};

export const deleteBillingCap = async (apiToken, id) => {
    try {
        await apiClient.delete(`/billing/cap?id=${id}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to delete billing cap' };
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
        const res = error.response?.data;
        const message = res?.message || res?.error?.message || res?.msg || res?.error || 'Failed to create service account';
        return { success: false, message: typeof message === 'string' ? message : 'Failed to create service account' };
    }
};

export const deleteServiceAccount = async (apiToken, id) => {
    try {
        await apiClient.delete(`/v1/service-accounts/${id}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        return { success: true };
    } catch (error) {
        const res = error.response?.data;
        const message = res?.message || res?.error?.message || res?.msg || 'Failed to delete service account';
        return { success: false, message: typeof message === 'string' ? message : 'Failed to delete service account' };
    }
};
