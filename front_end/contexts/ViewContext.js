'use client';

import { createContext, useContext, useState } from 'react';

const ViewContext = createContext();

export const ViewProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState(1);
  const [dogId, setDogId] = useState(1);
  const [userType, setUserType] = useState(1)
  return (
    <ViewContext.Provider value={{ currentView, setCurrentView, dogId, setDogId, userType, setUserType }}>
      {children}
    </ViewContext.Provider>
  );
};

export const useView = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};