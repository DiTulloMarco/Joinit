'use client';
import React, { useEffect, useContext, useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import axios from 'axios';
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { RegisterFormType } from '@/types/RegisterFormType';
import { useRouter } from 'next/navigation';
import { AppRoutes } from '@/enums/AppRoutes';
import { toast } from '@/hooks/use-toast';

const url = process.env.API_URL


export default function Register() {

  const { control, register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormType>()
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        specialChar: false,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const password = watch('password');
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    useEffect(() => {
        if (password) {
            setPasswordCriteria({
                length: password.length >= 8,
                specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            });
        }
    }, [password]);

    const onSubmit: SubmitHandler<RegisterFormType> = async (data) => {
        try {
            setLoading(true);
            const response = await axios.post(`${url}/users/register/`, data);
            if (response.data.token) {
                console.log(response.data);
                const user = response.data.user;
                const userId = user.id;
                const accessToken = response.data.token;
                localStorage.setItem('userId', userId.toString());
                localStorage.setItem('authToken', accessToken.access);
                console.log( 'register success');
            }
            toast({
                title: 'Registrazione completata',
                description: 'Registrazione effettuata con successo'
              });
            setLoading(false);
            router.push(AppRoutes.LOGIN);
        }
        catch (error: any) {
            console.error('errore', error);
            console.log(error.response.data.email[0]);
            if(error.response.data.email[0].includes("User with this email address already exists.")) {
              toast({
                title: 'Errore', 
                description: 'esiste già un utente con questa email',
                duration: 5000,
              })
            }else{

              toast({
                title: 'Errore', 
                description: 'Errore durante la registrazione',
                duration: 5000,
              });
            }
            setLoading(false);
        }
    }

  return (
    <div className="min-h-screen flex items-center justify-center text-black bg-white dark:from-gray-800 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg w-96">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
          <label htmlFor="first_name" className="form-label">
            Nome
          </label>
          <input
            type="text"
            id="first_name"
            placeholder="Inserisci il tuo nome"
            className="primary-input"
            defaultValue=""
            {...register('first_name')}
            required
          />
          </div>
          <div>
          <label htmlFor="last_name" className="form-label">
            Cognome
          </label>
          <input
            type="text"
            id="last_name"
            placeholder="Inserisci il tuo cognome"
            className="primary-input"
            defaultValue=""
            {...register('last_name')}
            required
          />
          </div>
          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="text"
              id="email"
              placeholder="Inserisci la tua email"
              className="primary-input"
              defaultValue=""
              {...register('email')}
              required
              />
          </div>
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
          <button 
            type="submit"
            className="primary-button mt-2"
          >
            Registrati
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 pb-2">Hai già un account?</p>
        </div>
        <a href="/login"
           className="primary-button mt-2"
          >
          Accedi
        </a>
      </div>
    </div>
  );
}
