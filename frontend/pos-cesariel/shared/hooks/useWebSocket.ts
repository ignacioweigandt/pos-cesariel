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
    maxReconnectAttempts = 10,
    onConnect,
    onDisconnect,
    onMessage,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnect = useRef(true);
  const reconnectAttemptsRef = useRef(0);
  const isConnecting = useRef(false);
  const urlRef = useRef(url);

  // Store callbacks in refs to avoid dependency issues
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onMessageRef.current = onMessage;
    onErrorRef.current = onError;
  }, [onConnect, onDisconnect, onMessage, onError]);

  // Update URL ref
  useEffect(() => {
    urlRef.current = url;
  }, [url]);

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting.current) {
      console.log('WebSocket: Already connecting, skipping');
      return;
    }

    const currentUrl = urlRef.current;

    if (!currentUrl) {
      console.log('WebSocket: No URL provided, skipping connection');
      return;
    }

    // Check if already connected
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket: Already connected, skipping');
      return;
    }

    // Check if connecting
    if (ws.current?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket: Connection in progress, skipping');
      return;
    }

    // Set connecting flag BEFORE any async operation to prevent race conditions
    isConnecting.current = true;

    // Clean up any existing connection before creating new one
    if (ws.current) {
      try {
        ws.current.close();
      } catch (e) {
        // Ignore close errors
      }
      ws.current = null;
    }

    console.log('WebSocket: Attempting to connect to', currentUrl);

    try {
      ws.current = new WebSocket(currentUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        isConnecting.current = false;
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        onConnectRef.current?.();
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        isConnecting.current = false;
        setIsConnected(false);
        onDisconnectRef.current?.();

        // Only reconnect if we should and haven't exceeded max attempts
        if (shouldReconnect.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          // Exponential backoff: 5s, 10s, 20s, 40s... capped at 60s
          const backoff = Math.min(reconnectInterval * Math.pow(2, reconnectAttemptsRef.current), 60000);
          console.log(`WebSocket: Reconnecting in ${backoff/1000}s (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

          reconnectTimer.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, backoff);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log('WebSocket: Max reconnection attempts reached');
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          setMessages(prev => [...prev.slice(-49), message]); // Keep last 50 messages
          onMessageRef.current?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.warn('WebSocket connection failed (this is normal if backend WebSocket is not available):', {
          url: currentUrl,
          type: error.type
        });
        isConnecting.current = false;
        onErrorRef.current?.(error);
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      isConnecting.current = false;
    }
  }, [maxReconnectAttempts, reconnectInterval]); // Minimal dependencies

  const disconnect = useCallback(() => {
    shouldReconnect.current = false;
    isConnecting.current = false;
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
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

  // Connect on mount and when URL changes
  useEffect(() => {
    if (!url) return;

    shouldReconnect.current = true;
    reconnectAttemptsRef.current = 0;
    connect();

    return () => {
      shouldReconnect.current = false;
      isConnecting.current = false;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [url, connect]);

  return {
    isConnected,
    lastMessage,
    messages,
    sendMessage,
    disconnect,
    clearMessages,
    reconnectAttempts: reconnectAttemptsRef.current
  };
};

// Hook para notificaciones específicas del POS
export const usePOSWebSocket = (branchId: number, token: string, enabled: boolean = true) => {
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Store values in refs to use in callbacks without causing re-renders
  const branchIdRef = useRef(branchId);
  const tokenRef = useRef(token);
  const enabledRef = useRef(enabled);
  const sendMessageRef = useRef<((message: any) => boolean) | null>(null);
  const subscriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs when values change
  useEffect(() => {
    branchIdRef.current = branchId;
    tokenRef.current = token;
    enabledRef.current = enabled;
  }, [branchId, token, enabled]);

  // Only create URL when we have all required data
  // Use dynamic WebSocket URL detection (same logic as API client)
  const wsBaseUrl = getWebSocketBaseUrl();
  const url = enabled && token && branchId ? `${wsBaseUrl}/ws/${branchId}?token=${token}` : '';

  // Only log WebSocket connection attempts if there are issues
  useEffect(() => {
    if (enabled && (!token || !branchId)) {
      console.log('WebSocket: Not connecting - missing required data:', {
        token: token ? 'present' : 'missing',
        branchId: branchId || 'missing'
      });
    }
  }, [enabled, token, branchId]);

  // Memoized callbacks that use refs instead of values
  const handleMessage = useCallback((message: WebSocketMessage) => {
    // Skip heartbeat and pong messages from logging (keep-alive messages)
    if (message.type === 'pong' || message.type === 'server_heartbeat') {
      return;
    }

    // Skip subscription confirmation from user-facing logging
    if (message.type === 'subscription_confirmed') {
      console.log('WebSocket: Subscription confirmed', message.subscription_types);
      return;
    }

    // Skip connection established (already logged in handleConnect)
    if (message.type === 'connection_established') {
      return;
    }

    console.log('POS WebSocket message:', message);

    // Add to notifications if it's a relevant message type
    if (['inventory_change', 'new_sale', 'low_stock_alert', 'user_action', 'system_message', 'product_update', 'sale_status_change', 'dashboard_update'].includes(message.type)) {
      setNotifications(prev => [...prev.slice(-19), message]); // Keep last 20 notifications
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const handleConnect = useCallback(() => {
    if (enabledRef.current && tokenRef.current) {
      console.log(`Connected to POS WebSocket for branch ${branchIdRef.current}`);

      // Clear any pending subscription timeout
      if (subscriptionTimeoutRef.current) {
        clearTimeout(subscriptionTimeoutRef.current);
      }

      // Send subscription message after delay to ensure connection is fully stable
      // 500ms gives time for the server to process the connection
      subscriptionTimeoutRef.current = setTimeout(() => {
        subscriptionTimeoutRef.current = null;
        if (sendMessageRef.current) {
          const sent = sendMessageRef.current({
            type: 'subscribe',
            subscription_types: ['inventory_change', 'new_sale', 'low_stock_alert', 'user_action', 'system_message', 'product_update', 'sale_status_change', 'dashboard_update']
          });
          if (sent) {
            console.log('WebSocket: Subscription message sent successfully');
          }
        }
      }, 500);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log(`Disconnected from POS WebSocket for branch ${branchIdRef.current}`);
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
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  });

  // Update sendMessage ref when it changes
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Ping para mantener conexión activa (every 25 seconds to stay under typical 30s timeout)
  useEffect(() => {
    if (!isConnected || !enabled) return;

    const pingInterval = setInterval(() => {
      sendMessage({
        type: 'ping',
        timestamp: new Date().toISOString()
      });
    }, 25000);

    return () => clearInterval(pingInterval);
  }, [isConnected, enabled, sendMessage]);

  // Cleanup subscription timeout on unmount
  useEffect(() => {
    return () => {
      if (subscriptionTimeoutRef.current) {
        clearTimeout(subscriptionTimeoutRef.current);
        subscriptionTimeoutRef.current = null;
      }
    };
  }, []);

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