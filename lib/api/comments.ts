import axiosInstance from "./axios";

export const commentService = {
  getCommentsByPost: async (postId: string) => {
    const response = await axiosInstance.get(`/comments/posts/${postId}`);
    return response.data;
  },

  addComment: async (postId: string, content: string, parentId?: string) => {
    const response = await axiosInstance.post(`/posts/${postId}/comments`, 
      { content,
        ...(parentId && { parentId })
      });
    return response.data;
  },

  updateComment: async (id: string, content: string) => {
    const response = await axiosInstance.put(`/comments/${id}`, { content });
    return response.data;
  },

  deleteComment: async (id: string) => {
    const response = await axiosInstance.delete(`/comments/${id}`);
    return response.data;
  },

  likeComment: async (id: string) => {
    const response = await axiosInstance.post(`/likee/comments/${id}/like`);
    return response.data;
  },

  unlikeComment: async (id: string) => {
    const response = await axiosInstance.delete(`/likes/comments/${id}/like`);
    return response.data;
  },
};
