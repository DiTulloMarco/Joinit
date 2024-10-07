'use client';
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { AuthContextProp } from '../interfaces/Auth';

export const AuthContext = createContext<AuthContextProp>({
  isAuthenticated: false,
  authToken: null,
  userId: null,
  login: (token: string, userId: string) => { },
  logout: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined'){
      const token = sessionStorage.getItem('authToken');
      const storedUserId = localStorage.getItem('userId');
      setAuthToken(token);
      setUserId(storedUserId);
      setIsAuthenticated(!!token);
    } 
  }, []);

  const login = (token: string, userId: string) => {
    if (typeof window !== 'undefined'){
      sessionStorage.setItem('authToken', token);
      localStorage.setItem('userId', userId);
      setAuthToken(token);
      setUserId(userId);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined'){
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      setAuthToken(null);
      setUserId(null);
      setIsAuthenticated(false);
    }
  };

  const value = useMemo(() => ({ isAuthenticated, authToken, userId, login, logout }),
    [isAuthenticated, authToken, userId]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
