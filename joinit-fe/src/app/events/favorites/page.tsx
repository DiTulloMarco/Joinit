'use client';
import React, { useState, useEffect } from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import axios from 'axios';

const url = process.env.API_URL;

export default function FavoriteEventsPage() {
  const [favoriteEvents, setFavoriteEvents] = useState<MyEvent[]>([]);

  async function fetchFavoriteEvents() {
    try {
      const response = await axios.get(`${url}/events/favorites/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
      setFavoriteEvents(response.data.results || response.data || []); 
    } catch (error) {
      console.error('Errore durante il caricamento degli eventi preferiti:', error);
      setFavoriteEvents([]); 
    }
  }

  useEffect(() => {
    fetchFavoriteEvents();
  }, []);

  return (
    <main className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-8">I Tuoi Eventi Preferiti</h1>
      <section className="grid grid-cols-1 gap-6">
        {favoriteEvents && favoriteEvents.length > 0 ? (
          favoriteEvents.filter((event) => !event.cancelled) 
          .map((event) => (
            <EventCard
              key={event.id}
              event={event}
              canJoin={!event.joined_by.includes(parseInt(sessionStorage.getItem('userId')!))}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">Non hai ancora eventi tra i preferiti.</p>
        )}
      </section>
    </main>
  );
}
