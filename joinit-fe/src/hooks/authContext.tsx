'use client';
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { AuthContextProp } from '../interfaces/Auth';
import axios from 'axios';

import { AppRoutes } from '@/enums/AppRoutes';

const url = process.env.API_URL;

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

  const getAuthTokenFromRefresh = async ( refreshToken: string ) => {
    try {
      const response = await axios.post(`${url}/users/token_refresh/`, {
          refresh: refreshToken
      });
      return response.data;
    } catch (error) {
        console.error('Error find refreshToken', error);
    }
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined'){
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        getAuthTokenFromRefresh(refreshToken).then((data) => {
          login(data.access, data.user.id);
        });
      }
    } 
  }, []);

  const login = (token: string, userId: string) => {
    if (typeof window !== 'undefined'){
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('userId', userId);
      setAuthToken(token);
      setUserId(userId);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined'){
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userId');
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
