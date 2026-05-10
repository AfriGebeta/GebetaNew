import {apiClient} from "@/service/apiClient";


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
            `/credit-bundle/?page=${page}&limit=${limit}`,
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
