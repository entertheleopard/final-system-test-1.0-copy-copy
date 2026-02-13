import { createContext, useContext, useState, ReactNode } from 'react';

type LiveContextType = {
  isLive: boolean;
  startLive: () => void;
  endLive: () => void;
};

const LiveContext = createContext<LiveContextType | undefined>(undefined);

export function LiveProvider({ children }: { children: ReactNode }) {
  const [isLive, setIsLive] = useState(false);

  const startLive = () => setIsLive(true);
  const endLive = () => setIsLive(false);

  return (
    <LiveContext.Provider value={{ isLive, startLive, endLive }}>
      {children}
    </LiveContext.Provider>
  );
}

export function useLive() {
  const context = useContext(LiveContext);
  if (!context) {
    throw new Error('useLive must be used within a LiveProvider');
  }
  return context;
}
