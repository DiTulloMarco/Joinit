'use client';
import React, { useEffect } from 'react';
import { useContext, useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { AuthContext } from '@/hooks/authContext';
import { LoginFormType } from '@/types/LoginFormType';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AppRoutes } from '@/enums/AppRoutes';

const url = process.env.API_URL;

export default function Login() {
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormType>()
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  useEffect(() => {
      if(sessionStorage.getItem('authToken')) {
          router.push(AppRoutes.EVENTS);
      }
  }, []);
  
  const onSubmit: SubmitHandler<LoginFormType> = async (data) => {
      try {
          setLoading(true);
          const response = await axios.post(`${url}/users/login`, {
              email: data.email,
              password: data.password,
          });
          const { user, access, refresh } = response.data;
          console.log({ user, access, refresh });
          login(access, user.id);
          if (data.rememberMe) {
              localStorage.setItem('refreshToken', refresh);
          }
          router.push(AppRoutes.EVENTS);
          setLoading(false);
          console.log( 'login success');
      } catch (error) {
          console.error(error);
          console.error( 'login failed');
          setLoading(false);
      };
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-black bg-white dark:from-gray-800 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg w-96">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{
              required: { value: true, message: 'L\'email è obbligatoria' },
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'L\'email non è valida' }
            }}
            render={({ field, fieldState: { error } }) => (
              <div>
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type='email'
                  id="email"
                  placeholder="you@example.com"
                  className="primary-input"
                  {...field}
                  required
                  />
              </div>
            )}
          />
          <Controller
            name="password"
            control={control}
            defaultValue={""}
            rules={{
              required: { value: true, message: 'La password è obbligatoria' },
              minLength: { value: 8, message: 'La password deve contenere almeno 8 caratteri' },
              pattern: { value: /[!@#$%^&*(),.?":{}|<>]/, message: 'La password deve contenere almeno un carattere speciale' }
          }}
          render={({ field, fieldState: { error } }) => (
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Inserisci la tua password"
                    className="primary-input"
                    {...field}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={handleClickShowPassword}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
              </div>

                )}
              />
          <Controller
            name="rememberMe"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="mr-2"
                  checked={!!field.value} // Ensuring value is boolean
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <label htmlFor="rememberMe" className="form-label">
                  Ricordami
                </label>
              </div>
            )}
          />
          <button 
            type='submit'
            className="primary-button mt-2"
          >
            Accedi
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="form-label">Non hai un account?</p>
        </div>
        
        <a href="/register"
           className="primary-button mt-2"
          >
            Registrati
        </a>
      </div>
    </div>
  );
}





