'use client';
import React, { useEffect, useState } from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import axios from 'axios';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

const url = process.env.API_URL;

type EventFormType = {
  name: string;
  description: string;
  price: number;
  category: number;
  tags: string;
  place: string;
  event_date: string;
  participation_deadline: string;
  max_participants: number;
  cover_image?: File | null;
};

export default function EventPage(queryString: any) {
  const [eventId, setEventId] = useState<number>(-1);
  const [event, setEvent] = useState<MyEvent>({} as MyEvent);
  const [canJoin, setCanJoin] = useState<boolean>(false);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<EventFormType>();

  const fetchEvent = async () => {
    const response = await axios.get(`${url}/events/${eventId}/`);
    setEvent(response.data);
    setCanJoin(!response.data.joined_by.includes(parseInt(sessionStorage.getItem('userId')!)));
    setIsCreator(response.data.created_by === parseInt(sessionStorage.getItem('userId')!));
    setImagePreview(response.data.cover_image || null);
  };

  useEffect(() => {
    setEventId(queryString.params.id);
    if (eventId === -1) {
      return;
    }
    fetchEvent();
  }, [eventId]);

  const onEditFormSubmit: SubmitHandler<EventFormType> = async (data) => {
    try {
      const formattedTags = data.tags
        ? data.tags.split(',').map((tag) => tag.trim())
        : []; 
      const formData = new FormData();
  
      if (event.joined_by.length > data.max_participants) {
        alert('Il numero massimo di partecipanti non può essere inferiore ai partecipanti attuali.');
        return;
      }
  
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'tags') {
          if (formattedTags.length === 0) {
            formData.append('tags', JSON.stringify([]));
          } else {
            formattedTags.forEach((tag) => formData.append('tags', tag));
          }
        } else if (key === 'cover_image' && value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, typeof value === 'number' ? value.toString() : value);
        }
      });
      const response = await axios.patch(`${url}/events/${eventId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
  
      console.log('Event updated:', response.data);
      setEvent(response.data);
      setEditModalOpen(false);
      setImagePreview(response.data.cover_image || null);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };
  

  return (
    <main className="flex-1 p-8">
      <h2 className="text-3xl font-bold mb-4">{event.name}</h2>
      <EventCard event={event} canJoin={canJoin} />

      <section className="mt-8 space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Descrizione</h3>
          <p className="text-gray-700">{event.description}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Categoria</h3>
          <p className="text-gray-700">
            {[
              "Commerciale",
              "Culturale",
              "Musica",
              "Sportivo",
              "Artistico",
              "Storico",
              "Educativo",
              "Sanitario",
              "Intrattenimento",
              "Altro",
            ][event.category]}
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Deadline Partecipazione</h3>
          <p className="text-gray-700">
            {new Date(event.participation_deadline).toLocaleString()}
          </p>
        </div>
        <div>
        <h3 className="text-xl font-semibold">Tags</h3>
  {Array.isArray(event.tags) ? (
    <ul className="flex flex-wrap gap-2">
      {event.tags.map((tag: string, index: number) => (
        <li
          key={index}
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg"
        >
          {tag}
        </li>
      ))}
    </ul>
  ) : typeof event.tags === 'string' ? (
    <ul className="flex flex-wrap gap-2">
      {event.tags
        .split(',')
        .map((tag: string, index: number) => (
          <li
            key={index}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg"
          >
            {tag.trim()}
          </li>
        ))}
    </ul>
  ) : (
    <p className="text-gray-700">Nessun tag disponibile</p>
  )}
        </div>
        <div>
          <h3 className="text-xl font-semibold">Partecipanti</h3>
          <p className="text-gray-700">
            {event.joined_by?.length || 0} / {event.max_participants}
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Prezzo</h3>
          <p className="text-gray-700">{event.price} €</p>
        </div>
      </section>

      {isCreator && (
        <div className="mt-4">
          <button
            onClick={() => {
              setEditModalOpen(true);
              setValue("name", event.name);
              setValue("description", event.description);
              setValue("price", event.price);
              setValue("category", event.category);
              setValue("tags", Array.isArray(event.tags) ? event.tags.join(', ') : event.tags || '');
              setValue("place", event.place);
              setValue("event_date", event.event_date);
              setValue("participation_deadline", event.participation_deadline);
              setValue("max_participants", event.max_participants);
            }}
            className="primary-button"
          >
            Modifica Evento
          </button>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 flex items-center bg-gray-900 bg-opacity-50 justify-center z-40">
          <form
            onSubmit={handleSubmit(onEditFormSubmit)}
            className="bg-white rounded-lg p-6 px-10 w-1/2 space-y-4"
          >
            <h3 className="text-2xl font-bold mb-4">Modifica Evento</h3>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input {...field} placeholder="Nome Evento" className="primary-input" />
              )}
            />
            <Controller
              name="description"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea {...field} placeholder="Descrizione" className="primary-input" />
              )}
            />
            <Controller
              name="price"
              control={control}
              defaultValue={0}
              render={({ field }) => (
                <input {...field} type="number" placeholder="Prezzo" className="primary-input" />
              )}
            />
            <Controller
              name="category"
              control={control}
              defaultValue={0}
              render={({ field }) => (
                <select {...field} className="primary-input">
                  <option value="0">Commerciale</option>
                  <option value="1">Culturale</option>
                  <option value="2">Musica</option>
                  <option value="3">Sportivo</option>
                  <option value="4">Artistico</option>
                  <option value="5">Storico</option>
                  <option value="6">Educativo</option>
                  <option value="7">Sanitario</option>
                  <option value="8">Intrattenimento</option>
                  <option value="9">Altro</option>
                </select>
              )}
            />
            <Controller
              name="tags"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Tag (separati da virgole)"
                  className="primary-input"
                />
              )}
            />
            <Controller
              name="participation_deadline"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="datetime-local"
                  placeholder="Scadenza Partecipazione"
                  className="primary-input"
                />
              )}
            />
            <Controller
              name="max_participants"
              control={control}
              defaultValue={20}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  placeholder="Numero Massimo Partecipanti"
                  className="primary-input"
                />
              )}
            />
            <div>
              <label htmlFor="cover_image">Immagine di copertina</label>
              <input
                type="file"
                id="cover_image"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setValue('cover_image', e.target.files[0]);
                    setImagePreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
                className="primary-input"
              />
            </div>
            {imagePreview && (
              <div className="mt-4">
                <p>Anteprima:</p>
                <img src={imagePreview} alt="Anteprima" className="rounded-md shadow-md max-w-full max-h-48" />
              </div>
            )}
            <div className="flex justify-between">
              <button type="submit" className="primary-button">
                Salva Modifiche
              </button>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="secondary-button"
              >
                Annulla
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
