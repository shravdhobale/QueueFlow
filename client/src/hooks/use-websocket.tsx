import { useEffect, useRef, useState } from "react";

interface UseWebSocketOptions {
  businessId?: string;
  onMessage?: (data: any) => void;
}

export function useWebSocket({ businessId, onMessage }: UseWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!businessId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?businessId=${businessId}`;
    
    let reconnectTimer: NodeJS.Timeout;
    const connect = () => {
      try {
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          setIsConnected(true);
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

        ws.current.onclose = () => {
          setIsConnected(false);
          console.log('WebSocket disconnected, attempting to reconnect...');
          
          // Reconnect after 2 seconds
          reconnectTimer = setTimeout(() => {
            connect();
          }, 2000);
        };

        ws.current.onerror = (error) => {
          console.warn('WebSocket connection failed, will retry');
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [businessId, onMessage]);

  return { isConnected };
}
