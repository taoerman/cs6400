'use client';

import { createContext, useContext, useState } from 'react';

const ViewContext = createContext();

export const ViewProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState(1);
  const [currentReport, setCurrentReport] = useState('');
  const [reportMonth, setReportMonth] = useState(1);
  const [reportYear, setReportYear] = useState(2025);
  const [dogId, setDogId] = useState(1);
  const [userType, setUserType] = useState(1);
  const [dogName, setDogName] = useState('');

  return (
    <ViewContext.Provider value={{
      currentView,
      setCurrentView,
      currentReport,
      setCurrentReport,
      reportMonth,
      setReportMonth,
      reportYear,
      setReportYear,
      dogId,
      setDogId,
      userType,
      setUserType
    }}>
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