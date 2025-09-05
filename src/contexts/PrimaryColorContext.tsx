'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PrimaryColorContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

const PrimaryColorContext = createContext<PrimaryColorContextType>({
  primaryColor: '#3B82F6', // Default blue color
  setPrimaryColor: () => {},
});

export const usePrimaryColor = () => {
  const context = useContext(PrimaryColorContext);
  if (!context) {
    throw new Error('usePrimaryColor must be used within PrimaryColorProvider');
  }
  return context;
};

interface PrimaryColorProviderProps {
  children: React.ReactNode;
}

export function PrimaryColorProvider({ children }: PrimaryColorProviderProps) {
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');

  useEffect(() => {
    // Load primary color from localStorage or API
    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) {
      setPrimaryColor(savedColor);
    }
  }, []);

  const handleSetPrimaryColor = (color: string) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
  };

  return (
    <PrimaryColorContext.Provider value={{ primaryColor, setPrimaryColor: handleSetPrimaryColor }}>
      {children}
    </PrimaryColorContext.Provider>
  );
}