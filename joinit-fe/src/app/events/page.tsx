'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '@components/EventCard';
import { MyEvent } from '@/types/MyEvent';
import { AppRoutes } from '@/enums/AppRoutes';

const url = process.env.API_URL

export default function EventsPage() {
  const [featuredEvent, setFeaturedEvent] = useState<MyEvent | null>(null);
  const [otherEvents, setOtherEvents] = useState<MyEvent[]>([]);
  
  async function fetchEvents() {
    try {
        const response = await axios.get(`${url}/events/list_public/`);
        

        setFeaturedEvent(response.data.results[0]); 
        setOtherEvents(response.data.results.slice(1));
    } catch (error) {
        console.error("Errore durante il fetch degli eventi:", error);
    }
}

  useEffect(() => { 
    fetchEvents();
  }, []);

  return (
    <main className="flex-1 p-8">
      <h2 className="text-3xl font-bold mb-4">In Primo Piano</h2>
      {!featuredEvent && <p>Loading...</p>}
      {featuredEvent && 
      <EventCard 
        event={featuredEvent}
        canJoin={!featuredEvent.joined_by.includes(parseInt(sessionStorage.getItem('userId')!))}
      />
        }
      <h2 className="text-2xl font-bold mb-4 flex items-center pt-10">
        Altri Eventi
        <span className="material-icons text-lg ml-2">arrow_forward</span>
      </h2>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {otherEvents && otherEvents.map(event => (
          <EventCard 
          key={event.id}
          event={event}
          canJoin={!event.joined_by.includes(parseInt(sessionStorage.getItem('userId')!))} 
        />
        ))}
        {otherEvents.length === 0 && <p>Nessun altro evento per ora ;(</p>}
      </section>
    </main>
  );
}
