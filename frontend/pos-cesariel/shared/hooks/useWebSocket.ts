import { useEffect, useRef, useState, useCallback } from 'react';

// Production backend URL for Railway deployment
const PRODUCTION_BACKEND_URL = 'https://backend-production-c20a.up.railway.app';

/**
 * Get WebSocket base URL dynamically
 * Uses the same logic as the API client for consistency
 */
function getWebSocketBaseUrl(): string {
  // If environment variable is set, use it (highest priority)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'ws');
  }

  // Client-side: detect production by hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1';
    if (isProduction) {
      return PRODUCTION_BACKEND_URL.replace(/^http/, 'ws');
    }
  }

  // Default: localhost for development
  return 'ws://localhost:8000';
}

export interface WebSocketMessage {
  type: string;
  message?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface WebSocketOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = (url: string, options: WebSocketOptions = {}) => {
  const {
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    onConnect,
    onDisconnect,
    onMessage,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnect = useRef(true);

  const connect = useCallback(() => {
    try {
      if (!url) {
        console.log('WebSocket: No URL provided, skipping connection');
        return; // No conectar si no hay URL
      }
      
      if (ws.current?.readyState === WebSocket.OPEN) {
        return;
      }

      console.log('WebSocket: Attempting to connect to', url);
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setReconnectAttempts(0);
        onConnect?.();
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();

        if (shouldReconnect.current && reconnectAttempts < maxReconnectAttempts) {
          reconnectTimer.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          setMessages(prev => [...prev.slice(-49), message]); // Keep last 50 messages
          onMessage?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.warn('WebSocket connection failed (this is normal if backend WebSocket is not available):', {
          url: url,
          type: error.type
        });
        onError?.(error);
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }, [url, reconnectAttempts, maxReconnectAttempts, reconnectInterval, onConnect, onDisconnect, onMessage, onError]);

  const disconnect = useCallback(() => {
    shouldReconnect.current = false;
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    if (ws.current) {
      ws.current.close();
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket is not connected');
    return false;
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastMessage(null);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      shouldReconnect.current = false;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastMessage,
    messages,
    sendMessage,
    disconnect,
    clearMessages,
    reconnectAttempts
  };
};

// Hook para notificaciones específicas del POS
export const usePOSWebSocket = (branchId: number, token: string, enabled: boolean = true) => {
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Only create URL when we have all required data
  // Use dynamic WebSocket URL detection (same logic as API client)
  const wsBaseUrl = getWebSocketBaseUrl();
  const url = enabled && token && branchId ? `${wsBaseUrl}/ws/${branchId}?token=${token}` : '';
  
  // Only log WebSocket connection attempts if there are issues
  if (enabled && (!token || !branchId)) {
    console.log('WebSocket: Not connecting - missing required data:', {
      token: token ? 'present' : 'missing',
      branchId: branchId || 'missing'
    });
  }

  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('POS WebSocket message:', message);
    
    // Add to notifications if it's a relevant message type
    if (['inventory_change', 'new_sale', 'low_stock_alert', 'user_action', 'system_message', 'product_update', 'sale_status_change', 'dashboard_update'].includes(message.type)) {
      setNotifications(prev => [...prev.slice(-19), message]); // Keep last 20 notifications
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const {
    isConnected,
    lastMessage,
    messages,
    sendMessage,
    disconnect,
    clearMessages
  } = useWebSocket(url, {
    onMessage: handleMessage,
    onConnect: () => {
      if (enabled && token) {
        console.log(`Connected to POS WebSocket for branch ${branchId}`);
        // Send subscription message
        sendMessage({
          type: 'subscribe',
          subscription_types: ['inventory_change', 'new_sale', 'low_stock_alert', 'user_action', 'system_message', 'product_update', 'sale_status_change', 'dashboard_update']
        });
      }
    },
    onDisconnect: () => {
      console.log(`Disconnected from POS WebSocket for branch ${branchId}`);
    }
  });

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Ping para mantener conexión activa
  useEffect(() => {
    if (!isConnected || !enabled) return;

    const pingInterval = setInterval(() => {
      sendMessage({
        type: 'ping',
        timestamp: new Date().toISOString()
      });
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected, enabled, sendMessage]);

  return {
    isConnected,
    lastMessage,
    messages,
    notifications,
    unreadCount,
    sendMessage,
    disconnect,
    clearMessages,
    markAllAsRead,
    clearNotifications
  };
};