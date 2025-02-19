// src/hooks/useWebSocket.js

import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client'; // Importa socket.io-client
import { apiWebSocket } from '../../components/utils/Fetch';

export const useWebSocket = (initialState = []) => {
  const [estadoEquipos, setEstadoEquipos] = useState(initialState);
  const [socket, setSocket] = useState(null);

  // Establecer la conexión WebSocket con socket.io
  useEffect(() => {
    const socketUrl = apiWebSocket; // Asegúrate de que esta URL apunte a tu servidor de WebSocket con socket.io
    const newSocket = io(socketUrl, {
      transports: ['websocket'], // Usa solo el transporte WebSocket
    });

    newSocket.on('connect', () => {
      console.log('Conexión WebSocket establecida');
    });

    newSocket.on('eventoActualizado', (data) => {
      // Aquí, asumiendo que el servidor emite el evento 'estadoActualizado'
      const estadoNormalizado = data.estado.toUpperCase();
      setEstadoEquipos(prevState => ({
        ...prevState,
        [data.id_equipo]: estadoNormalizado,
      }));
      console.log('Recibido evento de actualización de estado:', data);
    });



    newSocket.on('disconnect', () => {
      console.log('Conexión WebSocket cerrada');
    });

    setSocket(newSocket);

    // Limpiar la conexión cuando el componente se desmonte
    return () => {
      newSocket.close();
    };
  }, []);

  // Función para enviar mensajes a través del WebSocket
  const sendSocketMessage = useCallback((message) => {
    if (socket) {
      socket.emit('enviarMensaje', message); // Usamos emit en lugar de send
    }
  }, [socket]);

  return {
    estadoEquipos,
    setEstadoEquipos,
    sendSocketMessage,
  };
};



