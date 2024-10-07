import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppRoutes } from '@/enums/AppRoutes';
import axios from 'axios';

const url = process.env.API_URL;

const AuthLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const refresh = localStorage.getItem('refreshToken');
    if (token || refresh) {
      if(!token){
        const response = axios.post(`${url}/users/token/refresh`, {refresh});
        response.then((data) => {
          if (data.data.access) {
            sessionStorage.setItem('authToken', data.data.access);
          }
        });
      }
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push(AppRoutes.LOGIN);
    }
  }, [router]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default AuthLoader;
