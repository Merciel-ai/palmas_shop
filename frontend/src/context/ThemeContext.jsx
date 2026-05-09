import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('palmas_theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('palmas_theme', newMode ? 'dark' : 'light');
  };

  const theme = {
    darkMode,
    toggleTheme,
    colors: darkMode ? {
      background: '#0B0B0B',
      card: '#1A1A1A',
      text: '#EAEAEA',
      textSecondary: '#9CA3AF',
      border: 'rgba(0, 255, 65, 0.2)',
      accent: '#00FF41'
    } : {
      background: '#FFFFFF',
      card: '#F5F5F5',
      text: '#1A1A1A',
      textSecondary: '#6B7280',
      border: 'rgba(0, 255, 65, 0.3)',
      accent: '#00FF41'
    }
  };

  return React.createElement(
    ThemeContext.Provider,
    { value: theme },
    React.createElement('div', { className: darkMode ? 'dark' : 'light' }, children)
  );
};
