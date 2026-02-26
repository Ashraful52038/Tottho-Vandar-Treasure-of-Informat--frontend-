import axiosInstance from "./axios";

export const postService = {
    getPosts: async (page: number = 1, limit: number = 10) => {
        const response = await axiosInstance.get(`/posts?page=${page}&limit=${limit}`);
        return response.data;
    },

    getPostById: async (id: string) => {
        const response = await axiosInstance.get(`/posts/${id}`);
        return response.data;
    },

    createPost: async (data: any) => {
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
        const response = await axiosInstance.post(`/posts/${id}/like`);
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
    }
};