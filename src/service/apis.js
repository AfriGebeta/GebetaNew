import {apiClient} from "@/service/apiClient";


export const getUser = async (apiToken) => {
    try {
        const data = await apiClient.get(
            `/user/me`,
        );
        return data.data.data;
    } catch (error) {
        return error;
    }
};

export const setToken = async (apiToken) => {
    try {
        const {data} = await apiClient.patch(
            `/user/updatetoken`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            }
        );

        return {
            success: true,
            data: data.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data.message || 'Failed to create token',
        };
    }
};

export const revokeToken = async (apiToken, token) => {
    try {
        const {data} = await apiClient.patch(
            `/user/revoke-token?token=${token}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`
                }
            }
        )

        return {
            success: true,
            data: data.data,
        }
    } catch (error) {
        return {
            success: false,
            message: error.response?.data.message || 'Failed to revoke token',
        }
    }
}

export const getUserUsage = async (apiToken) => {
    const {data} = await apiClient.get(`/usage/matrix`, {
        headers: {
            Authorization: `Bearer ${apiToken}`,
        },
    });

    return data.data
};

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
            `/credit-bundle/getAll?page=${page}&limit=${limit}`,
        );
        return data.data.data;
    } catch (error) {
        return error;
    }
};