export interface User {
    id: string;
    name: string;
    email: string;
    verified: boolean;
    avatar?: string;
    bio?: string;
    role: 'user' | 'admin' | 'moderator';
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface MessageResponse {
    message: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface Comment {
    id: string;
    content: string;
    authorId: string;
    author?: User;
    postId: string;
    likes: number;
    likesCount?: number;
    createdAt: string;
    updatedAt: string;
    isLiked?: boolean;
    parentId?: string;
    replies?: Comment[];
}

