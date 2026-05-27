import axios from "axios";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const errorData = error.response?.data;
            const errorMessage = errorData?.message || errorData?.error?.message || '';

            const isValidationError =
                errorMessage.toLowerCase().includes('invalid access token') ||
                errorMessage.toLowerCase().includes('access denied');

            if (!isValidationError) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('currentUser');
                    window.location.href = '/auth/signin';
                }
            }
        }
        return Promise.reject(error);
    }
);