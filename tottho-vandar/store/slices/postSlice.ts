import { postService } from '@/lib/api/posts';
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { message } from 'antd';

interface Post {
    id: string,
    title: string;
    content: string;
    excerpt?: string;
    authorId: string;
    author?: any;
    tags: string[];
    readingTime: number;
    likes: number;
    comments: number;
    createdAt: string;
    updatedAt: string;
    published: boolean;
}

interface PostState {
    posts: Post[];
    currentPost: Post | null;
    myPosts: Post[];
    isLoading: boolean;
    error: string | null;
    totalPosts: number;
    currentPage: number;
}

const initialState: PostState = {
    posts: [],
    currentPost: null,
    myPosts: [],
    isLoading: false,
    error: null,
    totalPosts: 0,
    currentPage: 1,
};

// Async thunks
export const fetchPosts = createAsyncThunk(
    'posts/fetchPosts',
    async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
        try {
        const response = await postService.getPosts(page, limit);
        return response;
        } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
        }
    }
);

export const fetchPostById = createAsyncThunk(
    'posts/fetchPostById',
    async (id: string, { rejectWithValue }) => {
        try {
        const response = await postService.getPostById(id);
        return response;
        } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
        }
    }
);

export const createPost = createAsyncThunk(
    'posts/createPost',
    async (postData: any, { rejectWithValue }) => {
        try {
        const response = await postService.createPost(postData);
        message.success('Post created successfully!');
        return response;
        } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create post');
        }
    }
);

export const updatePost = createAsyncThunk(
    'posts/updatePost',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
        const response = await postService.updatePost(id, data);
        message.success('Post updated successfully!');
        return response;
        } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update post');
        }
    }
);

export const deletePost = createAsyncThunk(
    'posts/deletePost',
    async (id: string, { rejectWithValue }) => {
        try {
        await postService.deletePost(id);
        message.success('Post deleted successfully!');
        return id;
        } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
        }
    }
);

export const likePost = createAsyncThunk(
    'posts/likePost',
    async (id: string, { rejectWithValue }) => {
        try {
        const response = await postService.likePost(id);
        return response;
        } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to like post');
        }
    }
);

export const fetchMyPost = createAsyncThunk(
    'posts/fetchMyPost',
    async (_, { rejectWithValue }) => {
        try {
        const response = await postService.getMyPosts();
        return response;
        } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to your post');
        }
    }
);

const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers:{
        clearCurrentPost: (state)=>{
            state.currentPost = null;
        },
        setPage: (state, action: PayloadAction<number>) => {
        state.currentPage = action.payload;
        },
    },
    extraReducers: (builder) => {
    builder
        // Fetch Posts
        .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        })
        .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.posts = action.payload.posts;
        state.totalPosts = action.payload.total;
        })
        .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        })

        // Fetch Post By Id
        .addCase(fetchPostById.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchPostById.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            state.currentPost = action.payload;
        })
        .addCase(fetchPostById.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        })


        // Create Post
        .addCase(createPost.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(createPost.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            state.posts = [action.payload, ...state.posts];
        })
        .addCase(createPost.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        })

         // Delete Post
        .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => {
            state.posts = state.posts.filter(post => post.id !== action.payload);
            if (state.myPosts.length > 0) {
            state.myPosts = state.myPosts.filter(post => post.id !== action.payload);
            }
        })

        // Fetch My Posts
        .addCase(fetchMyPost.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(fetchMyPost.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            state.myPosts = action.payload;
        })
        .addCase(fetchMyPost.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        })

        // Like Post
        .addCase(likePost.fulfilled, (state, action: PayloadAction<any>) => {
            const updatedPost = action.payload;
            const index = state.posts.findIndex(p => p.id === updatedPost.id);
            if (index !== -1) {
            state.posts[index] = updatedPost;
            }
            if (state.currentPost?.id === updatedPost.id) {
            state.currentPost = updatedPost;
            }
        });
    },
});

export const { clearCurrentPost, setPage } = postSlice.actions;
export default postSlice.reducer;