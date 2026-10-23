enum UserRole {
    USER = "USER",
}

enum UserTokenType {
    FEATUREACCESSTOKEN = "FEATUREACCESSTOKEN",
}

interface UserToken {
    id: string,
    token: string,
    tokenType: UserTokenType,
    scope: string[],
    legacy: true,
    revoked: false,
    createdAt: Date,
    updatedAt: Date
}

export interface User {
    id: string;
    username: string;
    email: string;
    phone?: string;
    allow_image_upload?: boolean;
    role: UserRole;
    token: UserToken[]
}

export interface AuthResponse {
    token: string;
    user: User;
}