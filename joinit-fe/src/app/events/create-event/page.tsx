'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import { AppRoutes } from '@/enums/AppRoutes';
import { CreateEventFormType } from '@/types/CreateEventFormType';

const url = process.env.API_URL

export default function CreateEventPage() {
  
  const { control, handleSubmit, formState: { errors } } = useForm<CreateEventFormType>()
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const onSubmit: SubmitHandler<CreateEventFormType> = async (data) => {
      console.log(data);
      try {
          // TODO: da implementare logica per loading
          setLoading(true);
          data.created_by = Number(sessionStorage.getItem('userId'));
          data.joined_by = [Number(sessionStorage.getItem('userId'))];
          const response = await axios.post(`${url}/events/`, data);
          router.push(AppRoutes.MY_EVENTS);
          setLoading(false);
          console.log( 'event created');
      } catch (error) {
          console.error(error);
          console.error( 'event creation failed');
          setLoading(false);
      };
    }
  
  
  return (
    <main className="flex-1 p-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Crea un Nuovo Evento</h1>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label 
            htmlFor="eventName" 
            className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
          >
            Nome dell&apos;Evento
          </label>
          
        <Controller
            name="name"
            control={control}
            defaultValue=""
            rules={{
              required: { value: true, message: 'Il nome è obbligatorio' },
            }}
            render={({ field, fieldState: { error } }) => (
              <div>
                <label htmlFor="name" className="form-label">
                 
                </label>
                <input
                  type='name'
                  id="name"
                  placeholder="Inserisci il nome dell'evento"
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  {...field} 
                  required
                  />
                  <p className="text-red-500">{error?.message}</p>
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
          <label 
            htmlFor="event_date" 
            className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
          >
            Data
          </label>
          <Controller
            name="event_date"
            control={control}
            defaultValue={new Date()}
            rules={{
              required: { value: true, message: 'La data è obbligatoria' },
            }}
            render={({ field, fieldState: { error } }) => (
              <div>
                <input
                  type='datetime-local'
                  min={new Date().toISOString().slice(0, 16)}
                  id="event_date"
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  {...field} 
                  value={field.value.toISOString().slice(0, 16)} // Convert Date to string
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                  required
                  />
                  <p className="text-red-500">{error?.message}</p>
                </div>
            )}
          />
          </div>
          <div>
          <label 
            htmlFor="participation_deadline" 
            className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
          >
            Deadline partecipazione
          </label>
          <Controller
            name="participation_deadline"
            control={control}
            defaultValue={new Date()}
            rules={{
              required: { value: true, message: 'La data è obbligatoria' },
              validate: (value: Date, data: CreateEventFormType) => {
                if (value > data.event_date) {
                  return 'La data di fine partecipazione deve essere precedente alla data dell\'evento';
                }
                return true;
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <div>
                <input
                  type='datetime-local'
                  min={new Date().toISOString().slice(0, 16)}
                  id="event_date"
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  {...field} 
                  value={field.value.toISOString().slice(0, 16)} // Convert Date to string
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                  required
                  />
                  <p className="text-red-500">{error?.message}</p>
                </div>
            )}
          />
          </div>
        </div>

        <div>
          <label 
            htmlFor="eventLocation" 
            className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
          >
            Luogo
          </label>
          <Controller
            name="place"
            control={control}
            defaultValue=""
            rules={{
              required: { value: true, message: 'Il luogo è obbligatorio' },
            }}
            render={({ field, fieldState: { error } }) => (
              <div>
                <input
                  type='text'
                  id="place"
                  placeholder="Inserisci il luogo dell'evento"
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  {...field} 
                  required
                  />
                  <p className="text-red-500">{error?.message}</p>
                </div>
            )}
          />
        </div>

        <div>
          <label 
            htmlFor="eventDescription" 
            className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
          >
            Descrizione
          </label>
          <Controller
            name="description"
            control={control}
            defaultValue=""
            rules={{
              required: { value: true, message: 'La descrizione è obbligatoria' },
            }}
            render={({ field, fieldState: { error } }) => (
                <div>
                  <textarea
                  id="description"
                  placeholder="Inserisci una descrizione dell'evento"
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  {...field} 
                  required
                  />
                  <p className="text-red-500">{error?.message}</p>
                </div>
            )}
          />
        </div>

        <button
         type="submit"
         onClick={handleSubmit(onSubmit)}
         className="min-w-32 w-1/5 flex justify-center py-2 px-4 border border-gray-400 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
        >
          Crea Evento
            
        </button>
      </form>
    </main>
  );
}
