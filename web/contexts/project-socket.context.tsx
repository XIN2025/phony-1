'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useSocket } from './socket.context';

interface RecordingUser {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
}

interface ProjectSocketContextType {
  currentProjectId: string;
  recordingUsers: RecordingUser[];
}

const ProjectSocketContext = createContext<ProjectSocketContextType | undefined>(undefined);

export const useProjectSocket = () => {
  const context = useContext(ProjectSocketContext);
  if (!context) {
    throw new Error('useProjectSocket must be used within a ProjectSocketProvider');
  }
  return context;
};

export const ProjectSocketProvider: React.FC<{
  children: React.ReactNode;
  projectId: string;
}> = ({ children, projectId }) => {
  const { socketRef } = useSocket();
  const [recordingUsers, setRecordingUsers] = React.useState<RecordingUser[]>([]);

  // Join project room and handle recording users updates
  useEffect(() => {
    if (!socketRef.current || !projectId) return;
    console.log('joining project', projectId);
    // Join project room
    socketRef.current?.emit('joinProject', projectId);

    // Listen for recording users updates
    socketRef.current?.on(
      'recordingUsers',
      (data: { projectId: string; users: RecordingUser[] }) => {
        if (data.projectId === projectId) {
          console.log('recording users updated', data.users);
          setRecordingUsers(data.users);
        }
      },
    );

    // Cleanup when leaving project page
    return () => {
      if (socketRef.current) {
        console.log('leaving project', projectId);
        socketRef.current?.emit('leaveProject', projectId);
      }
    };
  }, [projectId]);

  return (
    <ProjectSocketContext.Provider
      value={{
        currentProjectId: projectId,
        recordingUsers,
      }}
    >
      {children}
    </ProjectSocketContext.Provider>
  );
};
