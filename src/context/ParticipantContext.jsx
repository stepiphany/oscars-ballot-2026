import { createContext, useContext, useState } from 'react';

const ParticipantContext = createContext(null);

export function ParticipantProvider({ children }) {
  const [displayName, setDisplayName] = useState(null);
  return (
    <ParticipantContext.Provider value={{ displayName, setDisplayName }}>
      {children}
    </ParticipantContext.Provider>
  );
}

export function useParticipant() {
  return useContext(ParticipantContext);
}
