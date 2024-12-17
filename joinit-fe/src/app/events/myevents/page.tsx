'use client';
import React, { useState, useEffect } from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import axios from 'axios';

const url = process.env.API_URL;
export default function MyEventsPage() {
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${url}/users/auth/user_events/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
      setMyEvents(response.data.results || []);
      setHasError(false);
    } catch (error) {
      console.error('Errore durante il fetch degli eventi:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);
  return (
    <main className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-8">I Tuoi Eventi</h1>
      {isLoading ? (
        <p className="text-center text-gray-500">Caricamento in corso...</p>
      ) : hasError ? (
        <p className="text-center text-red-500">
          Si è verificato un errore durante il caricamento degli eventi.
        </p>
      ) : myEvents.length > 0 ? (
        <section className="grid grid-cols-1 gap-6">
          {myEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              canJoin={!event.joined_by.includes(parseInt(sessionStorage.getItem('userId')!))}
            />
          ))}
        </section>
      ) : (
        <p className="text-center text-gray-500">Non hai creato nessun evento, vai e organizza anche tu un evento, sei ancora in tempo anche se sei Ingegnere.</p>
      )}
    </main>
  );
}
