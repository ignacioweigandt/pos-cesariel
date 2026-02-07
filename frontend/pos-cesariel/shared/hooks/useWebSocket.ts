import { useEffect, useRef, useState } from 'react';

const PRODUCTION_BACKEND_URL = 'https://backend-production-c20a.up.railway.app';

// Debug mode: only log in production or when explicitly enabled
const DEBUG = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_WS_DEBUG === 'true';
const log = (...args: unknown[]) => DEBUG && console.log(...args);
const warn = (...args: unknown[]) => DEBUG && console.warn(...args);
const error = (...args: unknown[]) => console.error(...args); // Always log errors

/**
 * Determina URL base de WebSocket (usa misma lógica que API client).
 * Prioridad: NEXT_PUBLIC_API_URL > detección hostname > localhost.
 */
function getWebSocketBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'ws');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1';
    if (isProduction) {
      return PRODUCTION_BACKEND_URL.replace(/^http/, 'ws');
    }
  }

  return 'ws://localhost:8000';
}

// Base message type
type BaseWebSocketMessage = {
  type: string;
  message?: string;
  timestamp?: string;
};

// Specific message types with proper typing
type InventoryChangeMessage = BaseWebSocketMessage & {
  type: 'inventory_change';
  productId: number;
  newStock: number;
  branchId: number;
};

type NewSaleMessage = BaseWebSocketMessage & {
  type: 'new_sale';
  saleId: number;
  total: number;
  branchId: number;
};

type LowStockMessage = BaseWebSocketMessage & {
  type: 'low_stock_alert';
  productId: number;
  productName: string;
  currentStock: number;
  minStock: number;
};

type ProductUpdateMessage = BaseWebSocketMessage & {
  type: 'product_update';
  productId: number;
  action: 'create' | 'update' | 'delete';
};

type SaleStatusChangeMessage = BaseWebSocketMessage & {
  type: 'sale_status_change';
  saleId: number;
  status: string;
};

type DashboardUpdateMessage = BaseWebSocketMessage & {
  type: 'dashboard_update';
  data: unknown;
};

type UserActionMessage = BaseWebSocketMessage & {
  type: 'user_action';
  userId: number;
  action: string;
};

type SystemMessage = BaseWebSocketMessage & {
  type: 'system_message';
  severity: 'info' | 'warning' | 'error';
};

type ConnectionMessage = BaseWebSocketMessage & {
  type: 'connection_established' | 'subscription_confirmed';
  subscription_types?: string[];
};

type HeartbeatMessage = BaseWebSocketMessage & {
  type: 'ping' | 'pong' | 'server_heartbeat';
};

type SubscribeMessage = {
  type: 'subscribe';
  subscription_types: string[];
};

// Discriminated union type for all WebSocket messages
export type WebSocketMessage =
  | InventoryChangeMessage
  | NewSaleMessage
  | LowStockMessage
  | ProductUpdateMessage
  | SaleStatusChangeMessage
  | DashboardUpdateMessage
  | UserActionMessage
  | SystemMessage
  | ConnectionMessage
  | HeartbeatMessage
  | SubscribeMessage;

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

  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onMessageRef.current = onMessage;
    onErrorRef.current = onError;
  }, [onConnect, onDisconnect, onMessage, onError]);

  useEffect(() => {
    urlRef.current = url;
  }, [url]);

  // React Compiler optimizes this automatically - no useCallback needed
  const connect = () => {
    if (isConnecting.current) {
      log('WebSocket: Already connecting, skipping');
      return;
    }

    const currentUrl = urlRef.current;

    if (!currentUrl) {
      log('WebSocket: No URL provided, skipping connection');
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN) {
      log('WebSocket: Already connected, skipping');
      return;
    }

    if (ws.current?.readyState === WebSocket.CONNECTING) {
      log('WebSocket: Connection in progress, skipping');
      return;
    }

    isConnecting.current = true;

    if (ws.current) {
      try {
        ws.current.close();
      } catch (e) {
        // Ignore
      }
      ws.current = null;
    }

    log('WebSocket: Attempting to connect to', currentUrl);

    try {
      ws.current = new WebSocket(currentUrl);

      ws.current.onopen = () => {
        log('WebSocket connected');
        isConnecting.current = false;
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        onConnectRef.current?.();
      };

      ws.current.onclose = (event) => {
        // Ignore normal closures (1000, 1001) and HMR disconnections (1005, 1006)
        const isNormalClosure = [1000, 1001].includes(event.code);
        const isHMRDisconnect = [1005, 1006].includes(event.code) && process.env.NODE_ENV === 'development';
        
        if (!isNormalClosure && !isHMRDisconnect) {
          log('WebSocket disconnected', event.code, event.reason);
        }
        
        isConnecting.current = false;
        setIsConnected(false);
        onDisconnectRef.current?.();

        // Don't reconnect during HMR in development
        if (isHMRDisconnect) {
          return;
        }

        if (shouldReconnect.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          // Backoff exponencial: 5s, 10s, 20s, 40s... máx 60s
          const backoff = Math.min(reconnectInterval * Math.pow(2, reconnectAttemptsRef.current), 60000);
          log(`WebSocket: Reconnecting in ${backoff/1000}s (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

          reconnectTimer.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, backoff);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          error('WebSocket: Max reconnection attempts reached');
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          setMessages(prev => [...prev.slice(-49), message]);
          onMessageRef.current?.(message);
        } catch (err) {
          error('Error parsing WebSocket message:', err);
        }
      };

      ws.current.onerror = (err) => {
        // Only log errors in production or debug mode
        if (DEBUG) {
          warn('WebSocket connection failed:', { url: currentUrl });
        }
        isConnecting.current = false;
        onErrorRef.current?.(err);
      };

    } catch (err) {
      error('Error connecting to WebSocket:', err);
      isConnecting.current = false;
    }
  };

  // React Compiler optimizes this automatically
  const disconnect = () => {
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

  // Type-safe sendMessage - React Compiler handles optimization
  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    }
    warn('WebSocket is not connected');
    return false;
  };

  // React Compiler handles optimization
  const clearMessages = () => {
    setMessages([]);
    setLastMessage(null);
  };

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

/** Hook de WebSocket para POS: notificaciones, inventario, ventas por branch */
export const usePOSWebSocket = (branchId: number, token: string, enabled: boolean = true) => {
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const branchIdRef = useRef(branchId);
  const tokenRef = useRef(token);
  const enabledRef = useRef(enabled);
  const sendMessageRef = useRef<((message: WebSocketMessage) => boolean) | null>(null);
  const subscriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    branchIdRef.current = branchId;
    tokenRef.current = token;
    enabledRef.current = enabled;
  }, [branchId, token, enabled]);

  const wsBaseUrl = getWebSocketBaseUrl();
  const url = enabled && token && branchId ? `${wsBaseUrl}/ws/${branchId}?token=${token}` : '';

  useEffect(() => {
    if (DEBUG && enabled && (!token || !branchId)) {
      log('WebSocket: Not connecting - missing required data:', {
        token: token ? 'present' : 'missing',
        branchId: branchId || 'missing'
      });
    }
  }, [enabled, token, branchId]);

  // React Compiler optimizes this automatically
  const handleMessage = (message: WebSocketMessage) => {
    if (message.type === 'pong' || message.type === 'server_heartbeat') {
      return;
    }

    if (message.type === 'subscription_confirmed') {
      log('WebSocket: Subscription confirmed', message.subscription_types);
      return;
    }

    if (message.type === 'connection_established') {
      return;
    }

    log('POS WebSocket message:', message);

    if (['inventory_change', 'new_sale', 'low_stock_alert', 'user_action', 'system_message', 'product_update', 'sale_status_change', 'dashboard_update'].includes(message.type)) {
      setNotifications(prev => [...prev.slice(-19), message]);
      setUnreadCount(prev => prev + 1);
    }
  };

  // React Compiler optimizes this automatically
  const handleConnect = () => {
    if (enabledRef.current && tokenRef.current) {
      log(`Connected to POS WebSocket for branch ${branchIdRef.current}`);

      if (subscriptionTimeoutRef.current) {
        clearTimeout(subscriptionTimeoutRef.current);
      }

      // Delay de 500ms para asegurar conexión estable antes de suscribirse
      subscriptionTimeoutRef.current = setTimeout(() => {
        subscriptionTimeoutRef.current = null;
        if (sendMessageRef.current) {
          const sent = sendMessageRef.current({
            type: 'subscribe',
            subscription_types: ['inventory_change', 'new_sale', 'low_stock_alert', 'user_action', 'system_message', 'product_update', 'sale_status_change', 'dashboard_update']
          });
          if (sent) {
            log('WebSocket: Subscription message sent successfully');
          }
        }
      }, 500);
    }
  };

  // React Compiler optimizes this automatically
  const handleDisconnect = () => {
    log(`Disconnected from POS WebSocket for branch ${branchIdRef.current}`);
  };

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

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // React Compiler optimizes this automatically
  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  // React Compiler optimizes this automatically
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Ping cada 25s para mantener conexión activa (timeout típico: 30s)
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