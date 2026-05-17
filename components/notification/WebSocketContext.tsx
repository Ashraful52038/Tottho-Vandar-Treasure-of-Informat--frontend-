'use client';

import { useAppSelector } from '@/store/hooks/reduxHooks';
import { useWebSocket } from '@/store/hooks/useWebSocket';
import { createContext, ReactNode, useContext, useEffect } from 'react';

interface WebSocketContextType {
  isConnected: boolean;
  notifications: any[];
  unreadCount: number;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// ✅ Global storage for notifications (persist across reconnects)
let globalNotifications: any[] = [];
let globalUnreadCount = 0;

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAppSelector((state) => state.auth);
  const ws = useWebSocket(user?.id ? String(user.id) : undefined);
  
  // ✅ Store notifications globally
  useEffect(() => {
    if (ws.notifications.length > 0) {
      globalNotifications = ws.notifications;
      globalUnreadCount = ws.unreadCount;
    }
  }, [ws.notifications, ws.unreadCount]);
  
  const value: WebSocketContextType = {
    isConnected: ws.isConnected,
    notifications: ws.notifications.length > 0 ? ws.notifications : globalNotifications,
    unreadCount: ws.unreadCount > 0 ? ws.unreadCount : globalUnreadCount,
    markAllAsRead: ws.markAllAsRead,
    clearNotifications: ws.clearNotifications,
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};