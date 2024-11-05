// types/user.ts
export interface User {
    id: string;
    username: string;
    email: string;
    phone?: string;
    // add other user properties as needed
}

export interface AuthResponse {
    token: string;
    // add other auth response properties if needed
}