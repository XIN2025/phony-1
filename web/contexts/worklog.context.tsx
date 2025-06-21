'use client';
import { useContext } from 'react';
import { createContext } from 'react';

type WorklogContextType = {
  isWorklogUser: boolean;
};

const WorklogContext = createContext<WorklogContextType | undefined>(undefined);

export const useWorklog = () => {
  const context = useContext(WorklogContext);
  if (!context) {
    throw new Error('useWorklog must be used within a WorklogProvider');
  }
  return context;
};

export const WorklogProvider: React.FC<{ children: React.ReactNode; isWorklogUser: boolean }> = ({
  children,
  isWorklogUser,
}) => {
  return <WorklogContext.Provider value={{ isWorklogUser }}>{children}</WorklogContext.Provider>;
};
