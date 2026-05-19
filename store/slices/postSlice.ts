import { postService } from '@/lib/api/posts';
import { Post, PostFilters } from '@/types/posts';
import { Tag } from '@/types/tags';
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { message } from 'antd';


interface PostState {
    posts: Post[];
    currentPost: Post | null;
    myPosts: Post[];
    isLoading: boolean;
    error: string | null;
    totalPosts: number;
    currentPage: number;
    tags: Tag[];
}

const initialState: PostState = {
    posts: [],
    currentPost: null,
    myPosts: [],
    isLoading: false,
    error: null,
    totalPosts: 0,
    currentPage: 1,
    tags: [],
};

// Async thunks
export const fetchPosts = createAsyncThunk(
    'posts/fetchPosts',
    async (filters: PostFilters = {}, { rejectWithValue }) => {
        try {
            const response = await postService.getPosts(filters);
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
            message.error(error.response?.data?.error || 'Failed to create post');
            return rejectWithValue(error.response?.data);
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
            message.error(error.response?.data?.message || 'Failed to update post');
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
            message.error(error.response?.data?.message || 'Failed to delete post');
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

export const fetchMyPosts = createAsyncThunk(
    'posts/fetchMyPosts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await postService.getMyPosts();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch your posts');
        }
    }
);

export const fetchTags = createAsyncThunk(
    'posts/fetchTags',
    async (_, { rejectWithValue }) => {
        try {
            const response = await postService.getTags();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tags');
        }
    }
);

const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        clearCurrentPost: (state) => {
            state.currentPost = null;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        updateCommentCount: (state, action: PayloadAction<{ postId: string; delta: number }>) => {
        const { postId, delta } = action.payload;

        if (state.posts) {
            state.posts = state.posts.map(post =>
                post.id === postId
                    ? {
                        ...post,
                        commentsCount: Math.max(0, (post.commentsCount || 0) + delta),
                        comments: Math.max(0, (post.commentsCount || 0) + delta),
                    }
                    : post
            );
        }

        if (state.myPosts) {
            state.myPosts = state.myPosts.map(post =>
                post.id === postId
                    ? {
                        ...post,
                        commentsCount: Math.max(0, (post.commentsCount || 0) + delta),
                        comments: Math.max(0, (post.commentsCount || 0) + delta),
                    }
                    : post
            );
        }

        if (state.currentPost && state.currentPost.id === postId) {
            state.currentPost = {
                ...state.currentPost,
                commentsCount: Math.max(0, (state.currentPost.commentsCount || 0) + delta),
                comments: Math.max(0, (state.currentPost.commentsCount || 0) + delta),
            };
        }
    }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                if (action.payload?.posts) {
                    state.posts = action.payload.posts;
                    state.totalPosts = action.payload.total || action.payload.posts.length;
                } else if (Array.isArray(action.payload)) {
                    state.posts = action.payload;
                    state.totalPosts = action.payload.length;
                } else {
                    state.posts = [];
                    state.totalPosts = 0;
                }
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchPostById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPostById.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                state.currentPost = action.payload?.post || action.payload;
            })
            .addCase(fetchPostById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createPost.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createPost.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                const newPost = action.payload?.post || action.payload;
                if (newPost) {
                    state.posts = [newPost, ...state.posts];
                    console.log('New post added to feed:', newPost);
                }
            })
            .addCase(createPost.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            .addCase(updatePost.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updatePost.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                
                const updatedPost = action.payload?.post || action.payload;
                
                if (updatedPost?.id) {
                    
                    if (state.currentPost?.id === updatedPost.id) {
                        state.currentPost = updatedPost;
                    }
                    
                    const index = state.posts.findIndex(p => p.id === updatedPost.id);
                    if (index !== -1) {
                        state.posts[index] = updatedPost;
                    }
                    
                    const myIndex = state.myPosts.findIndex(p => p.id === updatedPost.id);
                    if (myIndex !== -1) {
                        state.myPosts[myIndex] = updatedPost;
                    }
                }
            })
            .addCase(updatePost.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => {
                state.posts = state.posts.filter(post => post.id !== action.payload);
                if (state.myPosts.length > 0) {
                    state.myPosts = state.myPosts.filter(post => post.id !== action.payload);
                }
                if (state.currentPost?.id === action.payload) {
                    state.currentPost = null;
                }
            })

            .addCase(fetchMyPosts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchMyPosts.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                if (action.payload?.posts) {
                    state.myPosts = action.payload.posts;
                } else if (Array.isArray(action.payload)) {
                    state.myPosts = action.payload;
                } else {
                    state.myPosts = [];
                }
            })
            .addCase(fetchMyPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(likePost.fulfilled, (state, action) => {
                const updatedPost = action.payload;
                if (!updatedPost?.id) return;
                
                const index = state.posts.findIndex(p => p.id === updatedPost.id);
                if (index !== -1) {
                    state.posts[index] = updatedPost;
                }
                
                if (state.currentPost?.id === updatedPost.id) {
                    state.currentPost = updatedPost;
                }
            })
            .addCase(fetchTags.fulfilled, (state, action: PayloadAction<any>) => {
                state.tags = action.payload?.tags || action.payload || [];
            });
    },
});

export const { clearCurrentPost, setPage, clearError, updateCommentCount } = postSlice.actions;
export default postSlice.reducer;