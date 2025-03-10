import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client'; // Importa socket.io-client
import { apiWebSocket } from '../../components/utils/Fetch';

let socketInstance = null; // Variable global para mantener una única conexión WebSocket

export const useWebSocket = (initialState = []) => {
  const [estadoEquipos, setEstadoEquipos] = useState(initialState);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(apiWebSocket, {
        transports: ['websocket'], // Usa solo el transporte WebSocket
      });

      socketInstance.on('connect', () => {
        console.log('Conexión WebSocket establecida');
      });

      socketInstance.on('eventoActualizado', (data) => {
        const estadoNormalizado = data.estado.toUpperCase();
        setEstadoEquipos((prevState) => ({
          ...prevState,
          [data.id_equipo]: estadoNormalizado,
        }));
        console.log('Recibido evento de actualización de estado:', data);
      });

      socketInstance.on('disconnect', () => {
        console.log('Conexión WebSocket cerrada');
      });
    }

    // Limpiar la conexión cuando el componente se desmonte
    return () => {
      if (socketInstance) {
        socketInstance.close();
        socketInstance = null;
      }
    };
  }, []);

  // Función para enviar mensajes a través del WebSocket
  const sendSocketMessage = useCallback((message) => {
    if (socketInstance) {
      socketInstance.emit('enviarMensaje', message);
    }
  }, []);

  return {
    estadoEquipos,
    setEstadoEquipos,
    sendSocketMessage,
  };
};
