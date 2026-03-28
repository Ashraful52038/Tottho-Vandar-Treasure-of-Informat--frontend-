// store/slices/profileSlice.ts

import { FollowUser, UserComment, UserLike, UserPost, UserProfile, userService } from '@/lib/api/user';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { message } from 'antd';

// Profile state type definition
interface ProfileState {
  profile: UserProfile | null;
  posts: UserPost[];
  comments: UserComment[];
  likes: UserLike[];
  followers: FollowUser[];
  following: FollowUser[];
  isLoading: boolean;
  error: string | null;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalFollowers: number;
  totalFollowing: number;
  currentPage: {
    posts: number;
    comments: number;
    likes: number;
    followers: number;
    following: number;
  };
}

// Initial state
const initialState: ProfileState = {
  profile: null,
  posts: [],
  comments: [],
  likes: [],
  followers: [],
  following: [],
  isLoading: false,
  error: null,
  totalPosts: 0,
  totalComments: 0,
  totalLikes: 0,
  totalFollowers: 0,
  totalFollowing: 0,
  currentPage: {
    posts: 1,
    comments: 1,
    likes: 1,
    followers: 1,
    following: 1,
  },
};

// Async thunk for fetching profile data
export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await userService.getProfile(userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load profile');
    }
  }
);

// Async thunk for fetching user posts
export const fetchUserPosts = createAsyncThunk(
  'profile/fetchPosts',
  async ({ userId, page = 1, limit = 10 }: { userId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await userService.getUserPosts(userId, page, limit);
      return { ...response, page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load posts');
    }
  }
);

// Async thunk for fetching user comments
export const fetchUserComments = createAsyncThunk(
  'profile/fetchComments',
  async ({ userId, page = 1, limit = 10 }: { userId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await userService.getUserComments(userId, page, limit);
      return { ...response, page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load comments');
    }
  }
);

// Async thunk for fetching user likes
export const fetchUserLikes = createAsyncThunk(
  'profile/fetchLikes',
  async ({ userId, page = 1, limit = 10 }: { userId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await userService.getUserLikes(userId, page, limit);
      return { ...response, page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load likes');
    }
  }
);

// Async thunk for fetching followers list
export const fetchFollowers = createAsyncThunk(
  'profile/fetchFollowers',
  async ({ userId, page = 1, limit = 20 }: { userId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await userService.getFollowers(userId, page, limit);
      return { ...response, page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load followers');
    }
  }
);

// Async thunk for fetching following list
export const fetchFollowing = createAsyncThunk(
  'profile/fetchFollowing',
  async ({ userId, page = 1, limit = 20 }: { userId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await userService.getFollowing(userId, page, limit);
      return { ...response, page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load following');
    }
  }
);

// Async thunk for following a user
export const followUser = createAsyncThunk(
  'profile/follow',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await userService.followUser(userId);
      message.success('User followed successfully');
      return { userId, ...response };
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to follow user');
      return rejectWithValue(error.response?.data?.message || 'Failed to follow user');
    }
  }
);

// Async thunk for unfollowing a user
export const unfollowUser = createAsyncThunk(
  'profile/unfollow',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await userService.unfollowUser(userId);
      message.success('User unfollowed successfully');
      return { userId, ...response };
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to unfollow user');
      return rejectWithValue(error.response?.data?.message || 'Failed to unfollow user');
    }
  }
);

// Create profile slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Reducer to clear profile data
    clearProfile: (state) => {
      state.profile = null;
      state.posts = [];
      state.comments = [];
      state.likes = [];
      state.followers = [];
      state.following = [];
      state.currentPage = {
        posts: 1,
        comments: 1,
        likes: 1,
        followers: 1,
        following: 1,
      };
    },
    // Reducer to reset posts
    resetPosts: (state) => {
      state.posts = [];
      state.currentPage.posts = 1;
    },
    // Reducer to reset comments
    resetComments: (state) => {
      state.comments = [];
      state.currentPage.comments = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.posts = action.payload.posts || [];
        } else {
          state.posts = [...state.posts, ...(action.payload.posts || [])];
        }
        state.totalPosts = action.payload.total || 0;
        state.currentPage.posts = action.payload.page + 1;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch comments
      .addCase(fetchUserComments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserComments.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.comments = action.payload.comments || [];
        } else {
          state.comments = [...state.comments, ...(action.payload.comments || [])];
        }
        state.totalComments = action.payload.total || 0;
        state.currentPage.comments = action.payload.page + 1;
      })
      .addCase(fetchUserComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch likes
      .addCase(fetchUserLikes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserLikes.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.likes = action.payload.likes || [];
        } else {
          state.likes = [...state.likes, ...(action.payload.likes || [])];
        }
        state.totalLikes = action.payload.total || 0;
        state.currentPage.likes = action.payload.page + 1;
      })
      .addCase(fetchUserLikes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch followers
      .addCase(fetchFollowers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.isLoading = false;
        const followersData = action.payload.followers || [];
        const totalData = action.payload.total || 0;
        
        if (action.payload.page === 1) {
          state.followers = followersData;
        } else {
          state.followers = [...state.followers, ...followersData];
        }
        state.totalFollowers = totalData;
        state.currentPage.followers = action.payload.page + 1;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch following
      .addCase(fetchFollowing.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.isLoading = false;
        const followingData = action.payload.following || [];
        const totalData = action.payload.total || 0;
        
        if (action.payload.page === 1) {
          state.following = followingData;
        } else {
          state.following = [...state.following, ...followingData];
        }
        state.totalFollowing = totalData;
        state.currentPage.following = action.payload.page + 1;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Follow/Unfollow updates
      .addCase(followUser.fulfilled, (state, action) => {
        // Update profile stats
        if (state.profile && state.profile.id === action.payload.userId) {
          if (state.profile.stats) {
            state.profile.stats.followers += 1;
          }
        }
        // Update followers list - set isFollowing to true
        state.followers = state.followers.map(f => 
          f.id === action.payload.userId ? { ...f, isFollowing: true } : f
        );
        
        // Update following list (if needed)
        state.following = state.following.map(f => 
          f.id === action.payload.userId ? { ...f, isFollowing: true } : f
        );
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        // Update profile stats
        if (state.profile && state.profile.id === action.payload.userId) {
          if (state.profile.stats) {
            state.profile.stats.followers = Math.max(0, state.profile.stats.followers - 1);
          }
        }
        // Update followers list - set isFollowing to false
        state.followers = state.followers.map(f => 
          f.id === action.payload.userId ? { ...f, isFollowing: false } : f
        );
        
        // Update following list (if needed)
        state.following = state.following.map(f => 
          f.id === action.payload.userId ? { ...f, isFollowing: false } : f
        );
      });
  },
});

export const { clearProfile, resetPosts, resetComments } = profileSlice.actions;
export default profileSlice.reducer;