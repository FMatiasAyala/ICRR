import { useContext } from 'react';
import { WebSocketContext } from './WebSocketContext';

export const useWebSocketContext = () => {
  return useContext(WebSocketContext);
};
