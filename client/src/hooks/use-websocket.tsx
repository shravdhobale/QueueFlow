import { useEffect, useRef, useState } from "react";

interface UseWebSocketOptions {
  businessId?: string;
  onMessage?: (data: any) => void;
}

export function useWebSocket({ businessId, onMessage }: UseWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!businessId) {
      setIsConnected(false);
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?businessId=${businessId}`;
    
    let reconnectTimer: NodeJS.Timeout;
    let isCleanupCalled = false;
    
    const connect = () => {
      if (isCleanupCalled || reconnectAttempts.current >= maxReconnectAttempts) {
        return;
      }

      try {
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          setIsConnected(true);
          reconnectAttempts.current = 0;
          console.log('WebSocket connected');
        };

        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage?.(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.current.onclose = (event) => {
          setIsConnected(false);
          
          if (!isCleanupCalled && reconnectAttempts.current < maxReconnectAttempts) {
            console.log('WebSocket disconnected, attempting to reconnect...');
            reconnectAttempts.current++;
            
            // Exponential backoff: 2s, 4s, 8s, 16s, 32s
            const delay = Math.min(2000 * Math.pow(2, reconnectAttempts.current - 1), 30000);
            
            reconnectTimer = setTimeout(() => {
              connect();
            }, delay);
          }
        };

        ws.current.onerror = (error) => {
          if (!isCleanupCalled) {
            console.warn('WebSocket connection failed, will retry');
          }
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      isCleanupCalled = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        ws.current.close();
      }
      setIsConnected(false);
    };
  }, [businessId, onMessage]);

  return { isConnected };
}
