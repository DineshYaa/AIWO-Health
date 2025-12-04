import { useEffect, useRef, useCallback, useState } from 'react';
import { queryClient } from '@/lib/queryClient';

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket(userId: string | undefined) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!userId) return;
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        socket.send(JSON.stringify({
          type: 'auth',
          userId: userId
        }));
      };

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        socketRef.current = null;
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
    }
  }, [userId]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'notification':
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
        break;
      
      case 'health_update':
        queryClient.invalidateQueries({ queryKey: ['/api/health'] });
        queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
        break;

      case 'audit_log':
        queryClient.invalidateQueries({ queryKey: ['/api/audit-logs'] });
        break;

      case 'booking_update':
        queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
        break;

      case 'protocol_update':
        queryClient.invalidateQueries({ queryKey: ['/api/protocols'] });
        queryClient.invalidateQueries({ queryKey: ['/api/protocols/active'] });
        break;

      case 'community_update':
        queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/community/my-stats'] });
        break;

      default:
        break;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    send,
    disconnect
  };
}
