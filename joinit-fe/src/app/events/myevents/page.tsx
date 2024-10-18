'use client';
import React, { useState, useEffect } from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import axios from 'axios';
import { AppRoutes } from '@/enums/AppRoutes';

const url = process.env.API_URL;
export default function MyEventsPage() {
  
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  
  async function fetchEvents() {
    const id = sessionStorage.getItem('userId');
    const response = await axios.get(`${url}/users/${id}/get_user_events/`);
    setMyEvents(response.data.results);
  }

  useEffect(() => { 
    fetchEvents();
  }, []);
  return (
    <main className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-8">I Tuoi Eventi</h1>
      <section className="grid grid-cols-1 gap-6">
        {myEvents.map(event => (
          <EventCard
          key={event.id}
          title={event.name}
          desc={event.description}
          date={new Date(event.event_date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + new Date(event.event_date).toLocaleTimeString('it-IT', { hour: 'numeric', minute: '2-digit' })}
          location={event.place}
          canJoin={true} 
          url={AppRoutes.EVENT + event.id}
        />
        ))}
      </section>
    </main>
  );
}
