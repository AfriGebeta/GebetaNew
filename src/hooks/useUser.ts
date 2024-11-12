// hooks/useUser.ts
import {useQuery} from "@tanstack/react-query";
import {apiClient} from "@/service/apiClient";
import useLocalStorage from "@/hooks/use-local-storage";
import {User} from "@/types/user";

export const useUser = () => {
    const [authToken] = useLocalStorage({
        key: 'authToken',
        defaultValue: null,
    });

    return useQuery<User>({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await apiClient.get("/api/me", {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            return response.data;
        },
        enabled: !!authToken,
    });
};