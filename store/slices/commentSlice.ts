import { commentService } from "@/lib/api/comments";
import { Comment } from "@/types/comments";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { message } from "antd";

interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  isLoading: false,
  error: null,
};

export const fetchComments = createAsyncThunk(
    'comments/fetchByPost',
    async (postId: string, { rejectWithValue }) => {
        try {
        const response = await commentService.getCommentsByPost(postId);
        return response;
        } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
        }
    }
);

export const addComment = createAsyncThunk(
    'comments/add',
    async ({ postId, content, parentId }: { postId: string; content: string;parentId?: string }, { rejectWithValue }) => {
        try {
        const response = await commentService.addComment(postId, content, parentId);
        message.success('Comment added successfully!');
        return response;
        } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
        }
    }
);

export const updateComment = createAsyncThunk(
  'comments/update',
  async ({ id, content }: { id: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await commentService.updateComment(id, content);
      message.success('Comment updated successfully!');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await commentService.deleteComment(id);
      message.success('Comment deleted successfully!');
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

export const likeComment = createAsyncThunk(
  'comments/like',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await commentService.likeComment(id);
      return { id, likes: response.likes };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like comment');
    }
  }
);

export const unlikeComment = createAsyncThunk(
  'comments/unlike',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await commentService.unlikeComment(id);
      return { id, likes: response.likes };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unlike comment');
    }
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.unshift(action.payload);
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const index = state.comments.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.comments[index] = action.payload;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(c => c.id !== action.payload);
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        const { id, likes } = action.payload;
        const comment = state.comments.find(c => c.id === id);
        if (comment){
          comment.likes = likes;
          comment.isLiked = true;
        }
      })
      .addCase(unlikeComment.fulfilled, (state, action) => {
        const { id, likes } = action.payload;
        const comment = state.comments.find(c => c.id === id);
        if (comment) {
          comment.likes = likes;
          comment.isLiked = false;
        }
      });
  },
});

export const { clearComments } = commentSlice.actions;
export default commentSlice.reducer;