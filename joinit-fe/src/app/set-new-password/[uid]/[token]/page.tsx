'use client';
import React from 'react';
import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AppRoutes } from '@/enums/AppRoutes';
import { useToast } from '@/hooks/use-toast';


const url = process.env.API_URL;
const clientId = process.env.GOOGLE_CLIENT_ID;
type RecoverPasswordFormType = {
    password: string;
    confirmPassword: string;
}
export default function SetNewPassword({ params }: any) {
  
  const { control, handleSubmit, formState: { errors } } = useForm<RecoverPasswordFormType>()
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {setShowPassword((show) => !show);}
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleClickShowConfirmPassword = () => {setShowConfirmPassword((show) => !show);}

  const { toast } = useToast();


    const onSubmit: SubmitHandler<RecoverPasswordFormType> = async (data) => {
        if(data.password !== data.confirmPassword){
          toast({
            title: 'Errore',
            description: 'Le password non corrispondono',
            duration: 5000,
          });
          return
        }
      try {
          const response = await axios.put(`${url}/users/auth/set_new_password/`, {
                uidb64: (await params).uid,
                token: (await params).token,
                password: data.password,
          });
          toast({
            title: 'Successo',
            description: 'Password cambiata con successo',
            duration: 5000,
          })
          router.push(AppRoutes.LOGIN);
          console.log( 'login success');
      } catch (error: any) {
          console.error(error);
          if(error.response.data.detail.includes("No active account found with the given credentials")){
            toast({
              title: 'Errore', 
              description: 'Credenziali non valide',
              duration: 5000,
            });
            return;
          }
          toast({
            title: 'Errore',
            description: 'Cambio password fallito',
            duration: 5000,
          });
      };
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center text-black bg-white dark:from-gray-800 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg w-96">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="password"
                control={control}
                defaultValue=''
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
                name="confirmPassword"
                control={control}
                defaultValue=''
                rules={{
                    required: { value: true, message: 'La password è obbligatoria' },
                    minLength: { value: 8, message: 'La password deve contenere almeno 8 caratteri' },
                    pattern: { value: /[!@#$%^&*(),.?":{}|<>]/, message: 'La password deve contenere almeno un carattere speciale' }
                }}
                render={({ field, fieldState: { error } }) => (
                    <div>
                    <label htmlFor="confirmPassword" className="form-label">
                        Password
                    </label>
                    <div className="relative">
                        <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        placeholder="ripeti la tua password"
                        className="primary-input"
                        {...field}
                        />
                        <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        onClick={handleClickShowConfirmPassword}
                        >
                        {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                    </div>
                )}
            />
          <button 
            type='submit'
            className="primary-button mt-2"
          >
            Set new password
          </button>
        </form>

      </div>
    </div>
  );
}





