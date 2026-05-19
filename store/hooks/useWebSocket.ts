'use client';

import { message as antMessage } from 'antd';
import { useEffect, useRef, useState } from 'react';

export interface WebSocketMessage {
  type: 'new_post' | 'new_like' | 'new_comment' | 'new_follow' | 'notification';
  title: string;
  message: string;
  data?: any;
  userId?: string;
  createdAt: number;
}

// Global WebSocket instance (singleton)
let globalSocket: WebSocket | null = null;
let globalUserId: string | null = null;
let globalListeners: ((data: WebSocketMessage) => void)[] = [];
let globalIsConnected = false;
let reconnectTimer: NodeJS.Timeout | null = null;

export function useWebSocket(userId?: string | number) {
  const [isConnected, setIsConnected] = useState<boolean>(globalIsConnected);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const listenerRef = useRef<((data: WebSocketMessage) => void) | null>(null);

  // Connect to WebSocket (only once globally)
  useEffect(() => {
    if (!userId) return;

    const userIdStr = userId.toString();
    
    // If already connected to same user, just update state
    if (globalSocket && globalSocket.readyState === WebSocket.OPEN && globalUserId === userIdStr) {
      console.log('✅ Using existing WebSocket connection for user:', userIdStr);
      setIsConnected(true);
      return;
    }

    // Close existing connection if different user
    if (globalSocket) {
      globalSocket.close();
      globalSocket = null;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
    const fullUrl = `${wsUrl}/ws?user_id=${userIdStr}`;
    
    console.log('🔌 Creating NEW WebSocket connection for user:', userIdStr);
    const socket = new WebSocket(fullUrl);
    globalSocket = socket;
    globalUserId = userIdStr;
    
    socket.onopen = () => {
      console.log('✅ WebSocket connected for user:', userIdStr);
      globalIsConnected = true;
      setIsConnected(true);
      
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };
    
    socket.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        console.log('📨 WebSocket message received:', data);

        let notificationsEnabled = true;
        if (typeof window !== 'undefined') {
          const preferences = localStorage.getItem('preferences');
          if (preferences) {
            const parsed = JSON.parse(preferences);
            notificationsEnabled = parsed.notificationsEnabled !== false;
          }
        }

        if (!notificationsEnabled) {
          console.log('🔕 Notifications disabled by user, skipping:', data.type);
          return;
        }
        
        console.log('📨 WebSocket message received:', data);
        
        // Update all components using this hook
        globalListeners.forEach(listener => listener(data));
        
        // Also show toast
        const getIcon = (): string => {
          switch (data.type) {
            case 'new_like': return '❤️';
            case 'new_comment': return '💬';
            case 'new_follow': return '👤';
            case 'new_post': return '📝';
            default: return '🔔';
          }
        };

        antMessage.success({
          content: `${getIcon()} ${data.title}: ${data.message}`,
          duration: 4,
        });
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    socket.onclose = () => {
      console.log('🔌 WebSocket disconnected for user:', userIdStr);
      globalIsConnected = false;
      setIsConnected(false);
      globalSocket = null;
      globalUserId = null;
      
      // Reconnect after 5 seconds
      reconnectTimer = setTimeout(() => {
        console.log('🔄 Reconnecting WebSocket for user:', userIdStr);
        if (userIdStr) {
          const newSocket = new WebSocket(fullUrl);
          globalSocket = newSocket;
        }
      }, 5000);
    };
    
    socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
    
    return () => {
      // Don't close socket on unmount - keep for other components
      // Just remove listener
    };
  }, [userId]);

  // Setup listener for this component
  useEffect(() => {
    const handleMessage = (data: WebSocketMessage) => {
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
      setLastMessage(data);
    };
    
    globalListeners.push(handleMessage);
    listenerRef.current = handleMessage;
    
    return () => {
      // Remove listener on unmount
      if (listenerRef.current) {
        const index = globalListeners.indexOf(listenerRef.current);
        if (index > -1) {
          globalListeners.splice(index, 1);
        }
      }
    };
  }, []);

  const markAsRead = (index: number): void => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = (): void => {
    setUnreadCount(0);
  };

  const clearNotifications = (): void => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const sendMessage = (message: any): void => {
    if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
      globalSocket.send(JSON.stringify(message));
    }
  };

  return {
    isConnected,
    lastMessage,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    sendMessage
  };
}