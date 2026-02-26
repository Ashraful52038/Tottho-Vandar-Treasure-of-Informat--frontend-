import axiosInstance from "./axios";

export interface LoginCredentials{
    email: string;
    password: string;
}

export interface SignupData {
    name: string;
    email: String;
    password: String;
}

export interface AuthResponse{
    user: {
        id: string;
        name: string;
        email: string;
        verified: boolean;
        avatar?: string;
        bio?: string;
    };
    token: string;
}

export interface MessageResponse {
    message: string;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await axiosInstance.post('/auth/login', credentials);
        return response.data;
    },

    signup: async (data: SignupData): Promise<MessageResponse> => {
        const response = await axiosInstance.post('/auth/login', data);
        return response.data;
    },

    verifyEmail: async (token:string): Promise<MessageResponse> => {
        const response = await axiosInstance.get(`/auth/verify-email?token=${token}`);
        return response.data;
    },

    forgetPassword: async (email: string): Promise<MessageResponse> => {
        const response = await axiosInstance.post('/auth/forget-password', {email});
        return response.data;
    },

    resetPassword: async (token: string, newPassword: string): Promise<MessageResponse> => {
        const response = await axiosInstance.post('/auth/forget-password', {token, newPassword});
        return response.data;
    },

    getCurrentUser: async (token: string): Promise<{user: AuthResponse['user']}> => {
        const response = await axiosInstance.get('/auth/me', {
            headers: {Authorization:`Bearer ${token}`}
        });
        return response.data;
    },

    logout: async(): Promise<void> =>{
        await axiosInstance.post('auth/logout');
    }
}