'use client';

import { createContext, useContext } from 'react';
import { usePOSWebSocket, WebSocketMessage } from '@/shared/hooks/useWebSocket';
import { useAuth } from '@/shared/hooks/useAuth';

interface WebSocketContextValue {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  messages: WebSocketMessage[];
  notifications: WebSocketMessage[];
  unreadCount: number;
  sendMessage: (message: WebSocketMessage) => boolean;
  disconnect: () => void;
  clearMessages: () => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isAuthenticated } = useAuth();
  const branchId = user?.branch_id || 0;
  const enabled = isAuthenticated && !!token && branchId > 0;

  const ws = usePOSWebSocket(branchId, token || '', enabled);

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext(): WebSocketContextValue {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    // Return safe defaults when used outside provider (e.g., login page)
    return {
      isConnected: false,
      lastMessage: null,
      messages: [],
      notifications: [],
      unreadCount: 0,
      sendMessage: () => false,
      disconnect: () => {},
      clearMessages: () => {},
      markAllAsRead: () => {},
      clearNotifications: () => {},
    };
  }
  return ctx;
}
