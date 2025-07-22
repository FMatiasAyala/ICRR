import React, { createContext, useReducer, useEffect, useRef, useState } from 'react';
import { webSocketReducer, initialState } from './webSocketReducer';
import { io } from 'socket.io-client';
import { apiWebSocket } from '../utils/Fetch';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(webSocketReducer, initialState);
  const socketRef = useRef(null); // Referencia para mantener la misma conexión
  const [notificaciones, setNotificaciones] = useState([]);
  const [equiposConEventoNuevo, setEquiposConEventoNuevo] = useState([]);

  useEffect(() => {
    const socket = io(apiWebSocket, {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket desconectado');
    });


    const handleSocketEvent = (event, payload) => {
      console.log('🔥 Dispatching WebSocket event:', event, payload);
      switch (event) {
        case 'equipoNuevo':
          dispatch({ type: 'EQUIPO_NUEVO', payload })
          break;

        case 'equipoUpdate':
          dispatch({ type: 'UPDATE_EQUIPO', payload })
          break;

        case 'eventoEstadoActualizado':
          dispatch({ type: 'UPDATE_EVENTO_ESTADO', payload });
          break;

        case 'eventoNuevo':
          dispatch({ type: 'EVENTO_NUEVO', payload });

          const idEquipo = payload.id_equipo;
          if (idEquipo) {
            setEquiposConEventoNuevo((prev) =>
              prev.includes(idEquipo) ? prev : [...prev, idEquipo]
            );
            setNotificaciones((prev) => [
              { mensaje: `🆕 Nuevo evento` },
              ...prev,
            ]);
          }
          break;

        case 'tecnicoNuevo':
          dispatch({ type: 'TECNICO_NUEVO', payload });
          break;

        case 'tecnicoAsignadoAEquipo':
          dispatch({ type: 'TECNICO_ASIGNADO_A_EQUIPO', payload });
          break;


        case 'tecnicoEliminado':
          const id = Number(payload)
          dispatch({ type: 'TECNICO_ELIMINADO', payload: id });
          break;


        case 'eventoActualizado':
          dispatch({ type: 'UPDATE_EVENTO', payload });
          dispatch({ type: 'UPDATE_EVENTO_FILTRADO', payload });
          break;
        case 'mantenimientoActualizado':
          dispatch({ type: 'UPDATE_MANTENIMIENTO', payload });
          setNotificaciones((prev) => [
            { mensaje: `🆕 Actualizacion de mantenimiento` },
            ...prev,
          ]);
          break;
        case 'mantenimientoNuevo':
          dispatch({ type: 'MANTENIMIENTO_NUEVO', payload });
          setNotificaciones((prev) => [
            { mensaje: `🆕 Nuevo Mantenimiento` },
            ...prev,
          ]);
          break;
        case 'equipoDadoDeBaja':
          dispatch({ type: 'EQUIPO_DADO_DE_BAJA', payload });
          break;
        default:
          console.warn(`⚠️ Evento WebSocket desconocido: ${event}`);
      }
    };


    socket.onAny((event, payload) => {
      console.log("📦 Event:", event);
      console.log("📬 Payload:", payload);
      if (event === 'mensaje' && payload?.type) {
        handleSocketEvent(payload.type, payload.data);
      } else {
        handleSocketEvent(event, payload);
      }
    });


    return () => {
      socket.disconnect();
    };
  }, []);



  const sendMessage = (tipo, data) => {
    if (socketRef.current) {
      socketRef.current.emit(tipo, data);
    } else {
      console.warn('⚠️ WebSocket no está conectado');
    }
  };

  return (
    <WebSocketContext.Provider value={{ state, dispatch, sendMessage, notificaciones, setNotificaciones, equiposConEventoNuevo, setEquiposConEventoNuevo, socketRef }}>
      {children}
    </WebSocketContext.Provider>
  );
};
