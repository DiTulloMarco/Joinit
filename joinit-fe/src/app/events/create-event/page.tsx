'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import { AppRoutes } from '@/enums/AppRoutes';
import { CreateEventFormType } from '@/types/CreateEventFormType';
import { Category } from '@/types/Category';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from "@/components/ui/badge"

const url = process.env.API_URL

export default function CreateEventPage() {
  
  const { control, handleSubmit, formState: { errors } } = useForm<CreateEventFormType>()
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const router = useRouter();

  const fetchCategories = async () => {
    const response = await axios.get(`${url}/events/event_types/`);
    setCategories(response.data.map((v: string, i: number) => {return {id: i, name: v} as Category}));
  }
  
  useEffect(() => {
    fetchCategories();
  }, [])


  const onSubmit: SubmitHandler<CreateEventFormType> = async (data) => {
    try {
        const formattedTags = data.tags ? data.tags.split(",").map(tag => tag.trim()) : [];
        const payload = {
            ...data,
            tags: formattedTags,
        };

        const response = await axios.post(`${url}/events/`, payload, {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
            },
        });
        const eventId = response.data.id;
        await axios.put(`${url}/events/${eventId}/join/`, {
          userId: sessionStorage.getItem("userId"),
        });
        router.push(AppRoutes.MY_EVENTS);
        console.log('Event created successfully');
    } catch (error) {
        console.error(error);
        console.error('Event creation failed');
    }
};

const handleRemoveTag = (tag: string) => {
  setTags(tags.filter((existingTag) => existingTag !== tag));
};
  
  return (
    <main className="flex-1 p-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Crea un Nuovo Evento</h1>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1"> Info Generali </TabsTrigger>
              <TabsTrigger value="tab2"> Dettagli </TabsTrigger>
            </TabsList>
          <TabsContent value="tab1" className='space-y-6'>
            <div className="space-y-4">
            <Controller
                name="name"
                control={control}
                defaultValue=""
                rules={{
                  required: { value: true, message: 'Il nome è obbligatorio' },
                }}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <label 
                      htmlFor="name" 
                      className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
                    >
                      Nome dell&apos;Evento
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
                      value={(() => {
                        const valueDate = new Date(field.value);                     
                      
                        const formattedDate = valueDate.toLocaleString("sv-SE", {
                          timeZone: "Europe/Rome",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });

                        const formattedForInput = formattedDate.replace(" ", "T");
                        return formattedForInput;
                      })()}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? new Date(e.target.value) : null); 
                      }}
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
                      value={(() => {
                        const valueDate = new Date(field.value);
                      
                        const formattedDate = valueDate.toLocaleString("sv-SE", {
                          timeZone: "Europe/Rome",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });
                      
                        const formattedForInput = formattedDate.replace(" ", "T");
                        return formattedForInput;
                      })()}
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

          </TabsContent>
          <TabsContent value="tab2" className='space-y-6'>
              <div className='flex space-x-3'>
                TAGS: &nbsp;
                {tags.map((tag, i) => (
                  <div key={i} onClick={() => handleRemoveTag(tag)}>
                    <Badge variant="default" className='cursor-pointer hover:opacity-70'>{tag}</Badge>
                  </div>
                ))}
              </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="category"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <label  
                      htmlFor="category" 
                      className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
                    >
                      Categoria
                    </label>
                    <select
                      id="category"
                      {...field}
                      value={field.value?.id}
                      className='w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400'
                      >
                      <option key={-1} value="">Seleziona una categoria</option>
                      {categories.map((category, index) => (
                        <option key={index} value={index}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-red-500">{error?.message}</p>
                  </div>
                )}
              />

              <Controller
                  name="tags"
                  control={control}
                  defaultValue=""
                  render={({ field, fieldState: { error } }) => (
                      <div>
                          <label
                              htmlFor="tags"
                              className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
                          >
                              Tags (separati da virgole)
                          </label>
                          <input
                              type="text"
                              id="tags"
                              placeholder="Inserisci i tag separati da virgole"
                              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                              {...field}
                          />
                          <p className="text-red-500">{error?.message}</p>
                      </div>
                  )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
            <Controller
                name="price"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <label  
                      htmlFor="price" 
                      className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
                    >
                      Prezzo
                    </label>
                    <input
                      type='number'
                      id="price"
                      min={0}
                      step=".01"

                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value).toFixed(2))}
                      placeholder="Inserisci il costo dell'evento"
                      className='w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400'
                    />
                    <p className="text-red-500">{error?.message}</p>
                  </div>
                )}
              />
              <Controller
                name="max_participants"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <label  
                      htmlFor="max_participants" 
                      className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
                    >
                      Massimo numero di partecipanti
                    </label>
                    <input
                      type='number'
                      id="max_participants"
                      min={0}
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value).toFixed(0))}
                      placeholder="Inserisci il numero massimo di partecipanti"
                      className='w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400'
                    />
                    <p className="text-red-500">{error?.message}</p>
                  </div>
                )}
              />

              <Controller
                name="is_private"
                defaultValue={false}
                control={control}
                render={({ field: { onChange, onBlur, value, name, ref }, fieldState: { invalid, isTouched, isDirty, error }, formState }) => (
                  <div>
                    <label  
                      htmlFor="is_private" 
                      className=" text-gray-700 dark:text-gray-300 font-bold mb-2 mr-10"
                    >
                      Evento Privato
                    </label>
                    <input
                      type='checkbox'
                      id="is_private"
                      onChange={onChange}
                      checked={value}
                    />
                    <p className="text-red-500">{error?.message}</p>
                  </div>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>
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
