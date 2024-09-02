// useWebSocket.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiWebSocket, apiAnuncio } from '../../../Api';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [anuncio, setAnuncio] = useState([]);
  const socketRef = useRef(null);

  const connectWebSocket = () => {
    socketRef.current = new WebSocket(apiWebSocket);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      socketRef.current.send(JSON.stringify({ type: 'fetch' }));
    };

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'init' || message.type === 'update') {
        fetch(apiAnuncio)
          .then(response => response.json())
          .then(data => setAnuncio(data));
      }
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket closed. Reconnecting...');
      setTimeout(connectWebSocket, 1000); // Reintenta conectar después de 1 segundo
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      console.log(error);
    };

  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendWebSocketMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{ anuncio, setAnuncio, sendWebSocketMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
