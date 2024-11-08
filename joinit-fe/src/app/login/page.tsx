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

export default function Login() {
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormType>()
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { login }: any = useContext(AuthContext);
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const onSubmit: SubmitHandler<LoginFormType> = async (data) => {
      try {
          setLoading(true);
          const response = await axios.post(`${url}/users/login`, {
              email: data.email,
              password: data.password,
          });
          const { user, access, refresh } = response.data;
          login(access, user.id);
          if (data.rememberMe) {
              localStorage.setItem('refreshToken', refresh);
          }
          router.push(AppRoutes.EVENTS);
          setLoading(false);
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
            description: 'Login fallito',
            duration: 5000,
          });
          setLoading(false);
      };
  };
  

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse;
    try{
      const jwt_decode: JwtPayload = jwtDecode(credential!); 
      const userData: GoogleRegisterType = {
        email: (jwt_decode as { email: string }).email,
        first_name: (jwt_decode as { given_name: string }).given_name,
        last_name: (jwt_decode as { family_name: string }).family_name,
        profile_picture: (jwt_decode as { picture: string }).picture
      };
      const response = await axios.post(`${url}/users/auth/signupWithGoogle/`, userData);
      const { user, token } = response.data;
      login(token.access, user.id);
    }catch(error){
      toast({
        title: 'Errore',
        description: 'Login fallito',
        duration: 5000,
      });
      return;
    }
    console.log(credentialResponse);
    router.push(AppRoutes.EVENTS);

  };

  const handleGoogleLoginError = () => {
    toast({
      title: 'Errore',
      description: 'Credenziali Google non valide',
      duration: 5000,
    });
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

        <GoogleOAuthProvider clientId='467250512053-24qijerapbsr6sn0ti9dj3ha1peae1d5.apps.googleusercontent.com'>
            <GoogleLogin 
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            >
            </GoogleLogin>
        </GoogleOAuthProvider>

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





