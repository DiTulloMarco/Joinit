'use client';
import React, { useState, useEffect } from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import axios from 'axios';

const url = process.env.API_URL;

export default function FavoriteEventsPage() {
  const [favoriteEvents, setFavoriteEvents] = useState<MyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchFavoriteEvents = async () => {
    try {
      const response = await axios.get(`${url}/events/favorites/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
  
      const events = response.data.results || response.data || [];
      
      const eventsWithFavoriteFlag = events.map((event: MyEvent) => ({
        ...event,
        is_favorite: true,
      }));
  
      setFavoriteEvents(eventsWithFavoriteFlag);
      setHasError(false);
    } catch (error) {
      console.error('Errore durante il caricamento degli eventi preferiti:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoriteEvents();
  }, []);

  return (
    <main className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-8">I Tuoi Eventi Preferiti</h1>

      {isLoading ? (
        <p className="text-center text-gray-500">Caricamento in corso...</p>
      ) : hasError ? (
        <p className="text-center text-red-500">
          Si è verificato un errore durante il caricamento degli eventi preferiti.
        </p>
      ) : favoriteEvents.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteEvents
            .filter((event) => !event.cancelled)
            .map((event) => (
              <EventCard
                key={event.id}
                event={event}
                canJoin={!event.joined_by.includes(parseInt(sessionStorage.getItem('userId')!))}
                canInteract={!event.cancelled || event.created_by == sessionStorage.getItem('userId')!}
              />
            ))}
        </section>
      ) : (
        <p className="text-center text-gray-500">Non hai ancora eventi tra i preferiti.</p>
      )}
    </main>
  );
}
