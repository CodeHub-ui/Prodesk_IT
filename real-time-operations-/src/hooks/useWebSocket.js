import { useCallback, useEffect, useRef, useState } from 'react';
import { getReconnectDelay, MAX_RECONNECT_ATTEMPTS } from '../utils/reconnect';
const SOCKET_URL = 'wss://echo.websocket.events';
export const CONNECTION_STATE = {
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  RECONNECTING: 'RECONNECTING',
};
export function useWebSocket(onMessage) {
  const [connectionState, setConnectionState] = useState(CONNECTION_STATE.CONNECTING);
  const socketRef = useRef(null);
  const attemptRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const unmountedRef = useRef(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  useEffect(() => {
    unmountedRef.current = false;
    function connect() {
      if (unmountedRef.current) return;
      const socket = new WebSocket(SOCKET_URL);
      socketRef.current = socket;
      socket.onopen = () => {
        attemptRef.current = 0;
        setConnectionState(CONNECTION_STATE.CONNECTED);
      };
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          onMessageRef.current?.(payload);
        } catch (error) {
          console.error('[useWebSocket] Ignoring malformed message payload', error);
        }
      };
      socket.onerror = () => {
        socket.close();
      };
      socket.onclose = () => {
        socketRef.current = null;
        if (unmountedRef.current) return;

        if (attemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setConnectionState(CONNECTION_STATE.DISCONNECTED);
          return;
        }
        setConnectionState(CONNECTION_STATE.RECONNECTING);
        const delay = getReconnectDelay(attemptRef.current);
        attemptRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };
    }
    connect();
    return () => {
      unmountedRef.current = true;
      clearTimeout(reconnectTimeoutRef.current);
      socketRef.current?.close();
    };
  }, []);
  const sendMessage = useCallback((data) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn('[useWebSocket] Cannot send message while disconnected');
      return false;
    }
    socket.send(JSON.stringify(data));
    return true;
  }, []);
  return { 
    connectionState, 
    sendMessage };
}
