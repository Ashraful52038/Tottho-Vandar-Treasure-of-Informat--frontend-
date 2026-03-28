import { User } from "@/types/user";
import axiosInstance from "./axios";

export interface UserProfile extends User {
    stats: {
        posts: number;
        followers: number;
        following: number;
        likes: number;
    };
    createdAt: string;
}

export interface UserPost {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    likes: number;
    comments: number;
    views: number;
    createdAt: string;
}

export interface UserComment {
    id: string;
    content: string;
    postId: string;
    postTitle: string;
    likes: number;
    createdAt: string;
}

export interface UserLike {
    id: string;
    type: 'post' | 'comment';
    postId: string;
    postTitle?: string;
    content?: string;
    likedAt?: string;
    createdAt: string;
}

export interface FollowUser {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    isFollowing: boolean;
}

export const userService = {
    // Get user profile by ID
    getProfile: async (userId: string): Promise<UserProfile> => {
        const response = await axiosInstance.get(`/users/${userId}`);
        return response.data;
    },

    // Get current user
    getCurrentUser: async (): Promise<User> => {
        const response = await axiosInstance.get('/user/me');
        return response.data;
    },

    // Update user profile
    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await axiosInstance.put('/user/me', data);
        return response.data;
    },

    // Get user posts
    getUserPosts: async (userId: string, page = 1, limit = 10): Promise<{posts: UserPost[], total: number}> => {
        const response = await axiosInstance.get(`/users/${userId}/posts`, {
        params: { page, limit }
        });
        return response.data;
    },

    // Get user comments
    getUserComments: async (userId: string, page = 1, limit = 10): Promise<{comments: UserComment[], total: number}> => {
        const response = await axiosInstance.get(`/users/${userId}/comments`, {
        params: { page, limit }
        });
        return response.data;
    },

    // Get user likes
    getUserLikes: async (userId: string, page = 1, limit = 10): Promise<{likes: UserLike[], total: number}> => {
        const response = await axiosInstance.get(`/users/${userId}/likes`, {
        params: { page, limit }
        });
        return response.data;
    },

    // Get followers
    getFollowers: async (userId: string, page = 1, limit = 20): Promise<{followers: FollowUser[], total: number}> => {
        const response = await axiosInstance.get(`/users/${userId}/followers`, {
        params: { page, limit }
        });
        return response.data;
    },

    // Get following
    getFollowing: async (userId: string, page = 1, limit = 20): Promise<{following: FollowUser[], total: number}> => {
        const response = await axiosInstance.get(`/users/${userId}/following`, {
        params: { page, limit }
        });
        return response.data;
    },

    // Follow user
    followUser: async (userId: string): Promise<{message: string}> => {
        const response = await axiosInstance.post(`/users/${userId}/follow`);
        return response.data;
    },

    // Unfollow user
    unfollowUser: async (userId: string): Promise<{message: string}> => {
        const response = await axiosInstance.delete(`/users/${userId}/follow`);
        return response.data;
    },

    // Check if following
    checkFollowing: async (userId: string): Promise<{isFollowing: boolean}> => {
        const response = await axiosInstance.get(`/users/${userId}/follow/status`);
        return response.data;
    },

    // Upload avatar
    uploadAvatar: async (file: File): Promise<{avatarUrl: string}> => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await axiosInstance.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // // Update profile
    // updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    //     const response = await axiosInstance.put('/users/profile', data);
    //     return response.data;
    // },
};