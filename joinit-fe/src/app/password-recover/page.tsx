'use client';
import React from 'react';
import { useContext, useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { AuthContext } from '@/hooks/authContext';
import { LoginFormType } from '@/types/LoginFormType';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AppRoutes } from '@/enums/AppRoutes';
import { useToast } from '@/hooks/use-toast';

import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { User } from '@/types/User';
import { GoogleRegisterType } from '@/types/GoogleRegisterType';

const url = process.env.API_URL;
const clientId = process.env.GOOGLE_CLIENT_ID;
type RecoverPasswordFormType = {
    email: string
}
export default function PasswordRecover() {
  
  const { control, handleSubmit, formState: { errors } } = useForm<RecoverPasswordFormType>()
  const router = useRouter();
  const { login }: any = useContext(AuthContext);
  const { toast } = useToast();


    const onSubmit: SubmitHandler<RecoverPasswordFormType> = async (data) => {
      try {
          const response = await axios.post(`${url}/users/auth/send_reset_password_email/`, {
              email: data.email,
          });
          toast({
            title: 'Successo',
            description: 'Email inviata con successo',
            duration: 5000,
          })
          router.push(AppRoutes.LOGIN);
      } catch (error: any) {
          if(error.response.data.Error.includes("User not found")){
            toast({
              title: 'Errore', 
              description: 'Credenziali non valide',
              duration: 5000,
            });
            return;
          }
          toast({
            title: 'Errore',
            description: 'Invio email fallito',
            duration: 5000,
          });
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
          <button 
            type='submit'
            className="primary-button mt-2"
          >
            Invia email
          </button>
        </form>

      </div>
    </div>
  );
}





