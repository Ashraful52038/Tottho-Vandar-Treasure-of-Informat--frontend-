import { Post, PostFilters } from '@/types/posts';
import axiosInstance from "./axios";

export interface PostsResponse {
    posts: Post[];
    total: number;
    page: number;
    totalPages: number;
}

export const postService = {
    getPosts: async (filters?: PostFilters): Promise<PostsResponse> => {
    const response = await axiosInstance.get('/posts', { 
        params: {
            page: filters?.page || 1,
            limit: filters?.limit || 10,
            tag: filters?.tag,
            author: filters?.author,
            search: filters?.search,
            sortBy: filters?.sortBy
        }
        });
        return response.data;
    },

    getPostById: async (id: string) => {
        const response = await axiosInstance.get(`/posts/${id}`);
        return response.data;
    },

    createPost: async (data: any) => {
        console.log('📤 Sending to backend:', data);
        const response = await axiosInstance.post('/posts', data);
        return response.data;
    },

    updatePost: async (id: string, data: any) => {
        const response = await axiosInstance.put(`/posts/${id}`, data);
        return response.data;
    },

    deletePost: async (id: string) => {
        const response = await axiosInstance.delete(`/posts/${id}`);
        return response.data;
    },

    likePost: async (id: string) => {
        const response = await axiosInstance.post(`/likes/posts/${id}`);
        return response.data;
    },

    getMyPosts: async () => {
        const response = await axiosInstance.get('/posts/my-posts');
        return response.data;
    },

    searchPosts: async (query: string, filters?: any) => {
        const response = await axiosInstance.get('/posts/search', {
        params: { q: query, ...filters }
        });
        return response.data;
    },

    getTags: async () => {
        const response = await axiosInstance.get('/tags');
        return response.data;
    },

    uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosInstance.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
};