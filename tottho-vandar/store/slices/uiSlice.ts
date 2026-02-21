import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
    mobileMenuOpen: boolean;
    notifications: Array<{
        id: string;
        type: 'success' | 'error' | 'info' | 'warning';
        message: string;
    }>;
}

const initialState: UIState = {
    theme: 'light',
    sidebarCollapsed: false,
    mobileMenuOpen: false,
    notifications: [],
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
            toggleTheme: (state) => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
        state.theme = action.payload;
        },
        toggleSidebar: (state) => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        },
        setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
        state.sidebarCollapsed = action.payload;
        },
        toggleMobileMenu: (state) => {
        state.mobileMenuOpen = !state.mobileMenuOpen;
        },
        addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id'>>) => {
        const id = Date.now().toString();
        state.notifications.push({ ...action.payload, id });
        },
        removeNotification: (state, action: PayloadAction<string>) => {
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
        clearNotifications: (state) => {
        state.notifications = [];
        },
    },
});

export const {
    toggleTheme,
    setTheme,
    toggleSidebar,
    setSidebarCollapsed,
    toggleMobileMenu,
    addNotification,
    removeNotification,
    clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;