import { authService } from "@/lib/api/auth";
import { User } from '@/types/user';
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { message } from "antd";

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

// Define response types based on your actual API responses
interface AuthResponse {
    user: User;
    token: string;
}

// Initial state object
const initialAuthState: AuthState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false
};

const loadState = (): AuthState => {
    try {
        if (typeof window === 'undefined') {
            return initialAuthState;
        }
        
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
            const user = JSON.parse(userStr);
            return {
                user,
                token,
                isLoading: false,
                error: null,
                isAuthenticated: true
            };
        }
    } catch (error) {
        console.error('Failed to load auth state:', error);
    }

    return initialAuthState;
};

const initialState: AuthState = loadState();

// Helper function to check if response is AuthResponse
function isAuthResponse(response: any): response is AuthResponse {
    return response && 'user' in response && 'token' in response;
}

// Helper function to check if response has user
function hasUser(response: any): response is { user: User } {
    return response && 'user' in response;
}

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await authService.login({ email, password });
            return response; // Don't cast, let the reducer handle it
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login Failed');
        }
    }
);

export const signup = createAsyncThunk(
    'auth/signup',
    async ({ name, email, password }: { name: string; email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await authService.signup({ name, email, password });
            return response;
        } catch (error: any) {
            return rejectWithValue(error);
        }
    }
);

export const verifyEmail = createAsyncThunk(
    'auth/verifyEmail',
    async (token: string, { rejectWithValue }) => {
        try {
            const response = await authService.verifyEmail(token);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Verification Failed");
        }
    }
);

export const resendVerificationEmail = createAsyncThunk(
    'auth/resendVerification',
    async (email: string, { rejectWithValue }) => {
        try {
            const response = await authService.resendVerificationEmail(email);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to resend verification email');
        }
    }
);

export const forgetPassword = createAsyncThunk(
    'auth/forgetPassword',
    async (email: string, { rejectWithValue }) => {
        try {
            const response = await authService.forgetPassword(email);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to send reset email");
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ token, newPassword }: { token: string; newPassword: string }, { rejectWithValue }) => {
        try {
            const response = await authService.resetPassword(token, newPassword);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Password reset Failed');
        }
    }
);

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
        try {
            const response = await authService.changePassword({ currentPassword, newPassword });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to change password');
        }
    }
);

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return rejectWithValue('No token found');

            const response = await authService.getCurrentUser(token);
            return response;
        } catch (error: any) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return rejectWithValue(error.response?.data?.message || 'Failed to get user');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            message.success('Logged out successfully');
        },
        clearError: (state) => {
            state.error = null;
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                console.log('Login payload:', action.payload);
                // Check response type
                if (isAuthResponse(action.payload)) {
                    state.isAuthenticated = true;
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    message.success('Login successfully');
                    localStorage.setItem('token', action.payload.token);
                    localStorage.setItem('user', JSON.stringify(action.payload.user));
                } else {
                    message.error('Invalid response from server');
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                message.error(action.payload as string);
            })

            // Signup
            .addCase(signup.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                
                if (isAuthResponse(action.payload)) {
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.isAuthenticated = true;
                    message.success('Registration successful! Please verify your email.');
                    localStorage.setItem('token', action.payload.token);
                    localStorage.setItem('user', JSON.stringify(action.payload.user));
                } else {
                    message.success('Registration successful! Please verify your email.');
                }
            })
            .addCase(signup.rejected, (state, action) => {
                state.isLoading = false;
                
                const err = action.payload as any;
                
                state.error = err?.error || err?.message || 'Signup failed';
                
                message.error(state.error);
            })

            // Verify Email
            .addCase(verifyEmail.fulfilled, (state, action: PayloadAction<any>) => {
                if (state.user) {
                    state.user.verified = true;
                    localStorage.setItem('user', JSON.stringify(state.user));
                }
                message.success(action.payload.message || 'Email verified successfully!');
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.error = action.payload as string;
                message.error(action.payload as string);
            })

            // Resend Verification
            .addCase(resendVerificationEmail.fulfilled, (state, action: PayloadAction<any>) => {
                message.success(action.payload.message || 'Verification email resent!');
            })
            .addCase(resendVerificationEmail.rejected, (state, action) => {
                state.error = action.payload as string;
                message.error(action.payload as string);
            })

            // Get Current User
            .addCase(getCurrentUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                
                if (hasUser(action.payload)) {
                    state.isAuthenticated = true;
                    state.user = action.payload.user;
                    localStorage.setItem('user', JSON.stringify(action.payload.user));
                } else {
                    state.isAuthenticated = false;
                }
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            })

            // Forget Password
            .addCase(forgetPassword.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(forgetPassword.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                message.success(action.payload.message || 'Password reset email sent!');
            })
            .addCase(forgetPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                message.error(action.payload as string);
            })

            // Reset Password
            .addCase(resetPassword.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(resetPassword.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                message.success(action.payload.message || 'Password reset successfully!');
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                message.error(action.payload as string);
            })

            // Change Password
            .addCase(changePassword.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(changePassword.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                message.success(action.payload.message || 'Password changed successfully!');
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                message.error(action.payload as string);
            });
    },
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;