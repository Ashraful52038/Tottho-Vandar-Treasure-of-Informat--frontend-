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

const normalizeComment = (comment: any): Comment => {
  return {
    id: comment.id,
    content: comment.content,
    postId: comment.postId,
    parentId: comment.parentId,
    author: comment.author || {
      id: comment.userId,
      name: comment.userName || 'Unknown',
      avatar: comment.userAvatar
    },
    likes: comment.likes || 0,
    isLiked: comment.isLiked || false,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    replies: comment.replies?.map(normalizeComment) || []
  };
};

export const fetchComments = createAsyncThunk(
  'comments/fetchByPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await commentService.getCommentsByPost(postId);
      const normalizedComments = response.map(normalizeComment);
      console.log('Normalized comments:', normalizedComments);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/add',
  async ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }, 
    { rejectWithValue }) => {
    try {
      const response = await commentService.addComment(postId, content, parentId);
      message.success('Comment added successfully!');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
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
      return { id, response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like comment');
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
        state.comments = action.payload || [];
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments = [action.payload, ...state.comments];
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(c => c.id !== action.payload);
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        const { id, response } = action.payload;
        
        state.comments = state.comments.map(comment => {
          if (comment.id === id) {
            return {
              ...comment,
              isLiked: response.message === "liked",
              likes: response.message === "liked" 
                ? (comment.likes || 0) + 1 
                : Math.max(0, (comment.likes || 0) - 1)
            };
          }
          return comment;
        });
      });
  },
});

export const { clearComments } = commentSlice.actions;
export default commentSlice.reducer;