import axios from "axios";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('currentUser');
                window.location.href = '/auth/signin';
            }
        }
        return Promise.reject(error);
    }
);