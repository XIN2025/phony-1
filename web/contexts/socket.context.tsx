'use client';

import React, { createContext, useContext, useEffect, useRef, MutableRefObject } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socketRef: MutableRefObject<Socket | null>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socketRef,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
