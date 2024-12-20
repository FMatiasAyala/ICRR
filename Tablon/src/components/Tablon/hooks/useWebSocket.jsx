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

      if (message.title && message.body) {
        sendNotification(message.title, message.body);
      }

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
    };

  };


  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().catch((error) =>
        console.error('Error al solicitar permisos de notificación:', error)
      );
    }

    connectWebSocket(); // Conecta el WebSocket al montar

    return () => {
      if (socketRef.current) {
        socketRef.current.close(); // Cierra el WebSocket al desmontar
      }
    };
  }, []);

  // Simulación de mensaje de prueba (puedes eliminar esto en producción)
  useEffect(() => {
    setTimeout(() => {
      sendNotification("Nuevo Anuncio", "Un nuevo anuncio ha sido publicado");
    }, 3000);
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

function sendNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
}