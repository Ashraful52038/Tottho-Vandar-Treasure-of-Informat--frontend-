import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import commentReducer from './slices/commentSlice';
import postReducer from './slices/postSlice';
import profileReducer from './slices/profileSlice';
import uiReducer from './slices/uiSlice';
export const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postReducer,
        ui: uiReducer,
        comments: commentReducer,
        profile: profileReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
        serializableCheck: false,
        }),
    devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;