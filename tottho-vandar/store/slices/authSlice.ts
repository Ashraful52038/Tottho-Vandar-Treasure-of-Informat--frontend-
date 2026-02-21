import { authService } from "@/lib/api/auth";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { message } from "antd";

interface User {
    id: string;
    name: string;
    email: string;
    verified: boolean;
    avatar?: string;
    bio?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

const initialState: AuthState ={
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
};

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password}: {email: string; password:string},{ rejectWithValue })=>
    {
        try {
            const response = await authService.login({ email, password})
            localStorage.setItem('token', response.token);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login Failed');
        }
    }
);

export const signup = createAsyncThunk(
    'auth/signup',
    async ({ name, email, password}: {name: string; email: string; password: string},
        {rejectWithValue}) =>{
            try {
                const response = await authService.signup({ name, email, password});
                return response;
            } catch (error: any) {
                return rejectWithValue(error.response?.data?.message || 'Signup Failed');
            }
        }
);

export const verifyEmail =createAsyncThunk(
    'auth/verifyEmail',
    async(token: string, {rejectWithValue})=>{
        try {
            const response = await authService.verifyEmail(token);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Verification Failed");
        }
    }
);

export const forgetPassword = createAsyncThunk(
    'auth/forgetPassword',
    async (email: string, { rejectWithValue })=>{
        try{
            const response = await authService.forgetPassword(email);
            return response;
        } catch(error: any){
            return rejectWithValue(error.response?.data?.message || "Failed to send reset email")
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ token, newPassword }: { token: string; newPassword: string }, { rejectWithValue})=>
    {
        try {
            const response = await authService.resetPassword(token, newPassword);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'password reset Failed');
        }
    }
);

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue })=>{
        try {
            const token = localStorage.getItem('token');
            if (!token) return rejectWithValue('No token found');

            const response = await authService.getCurrentUser(token);
            return response;
        } catch (error: any) {
            localStorage.removeItem('token');
            return rejectWithValue(error.response?.data?.message || 'Failed to get user');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers:{
        logout: (state) =>{
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            message.success('Logged out successfully');
        },
        clearError: (state)=>{
            state.error = null;
        },
    },
    extraReducers: ( builder ) =>{
        builder
        //login
        .addCase(login.pending, (state)=>{
            state.isLoading = true;
            state.error = null;
        })
        .addCase(login.fulfilled, (state, action: PayloadAction<any>)=>{
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            message.success('Login successfully');
        })
        .addCase(login.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload as string;
            message.error(action.payload as string);
        })

        //signup
        .addCase(signup.pending,(state)=>{
            state.isLoading = true;
            state.error = null;
            message.success('Registration successful! Please verify your email.');
        })
        .addCase(signup.fulfilled,(state)=>{
            state.isLoading = false;
            message.success('Registration successful! Please verify your email.');
        })
        .addCase(signup.rejected,(state, action)=>{
            state.isLoading = false;
            state.error = action.payload as string;
            message.error(action.payload as string);
        })

        //Get Current user
        .addCase(getCurrentUser.pending,(state)=>{
            state.isLoading = true;
        })
        .addCase(getCurrentUser.fulfilled,(state, action: PayloadAction<any>)=>{
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
        })
        .addCase(getCurrentUser.rejected,(state)=>{
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
        })

        // Forget Password
        .addCase(forgetPassword.pending ,(state)=>{
            state.isLoading = true;
        })
        .addCase(forgetPassword.fulfilled, (state)=>{
            state.isLoading = false;
        })
        .addCase(forgetPassword.rejected, (state, action)=>{
            state.isLoading = false;
            state.error = action.payload as string;
        });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;