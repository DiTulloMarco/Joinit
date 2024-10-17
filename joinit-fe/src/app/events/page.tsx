'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '@components/EventCard';
import { MyEvent } from '@/types/MyEvent';
import { AppRoutes } from '@/enums/AppRoutes';
import { stringify } from 'querystring';

const url = process.env.API_URL

export default function EventsPage() {
  const [featuredEvent, setFeaturedEvent] = useState<MyEvent | null>(null);
  const [otherEvents, setOtherEvents] = useState<MyEvent[]>([]);
  
  async function fetchEvents() {
    const response = await axios.get(`${url}/events/list_public/`);
    setFeaturedEvent(response.data.results[0]); 
    setOtherEvents(response.data.results.slice(1));
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
        title={featuredEvent.name} 
        desc={featuredEvent.description} 
        date={new Date(featuredEvent.event_date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + new Date(featuredEvent.event_date).toLocaleTimeString('it-IT', { hour: 'numeric', minute: '2-digit' })} 
        location={featuredEvent.place} 
        canJoin={true} 
        url={AppRoutes.EVENT + featuredEvent.id} 
      />
        }
      <h2 className="text-2xl font-bold mb-4 flex items-center pt-10">
        Altri Eventi
        <span className="material-icons text-lg ml-2">arrow_forward</span>
      </h2>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {otherEvents && otherEvents.map(event => (
          <EventCard 
          title={event.name} 
          desc={event.description} 
          date={new Date(event.event_date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + new Date(event.event_date).toLocaleTimeString('it-IT', { hour: 'numeric', minute: '2-digit' })} 
          location={event.place} 
          canJoin={true} 
          url={AppRoutes.EVENT + event.id} 
        />
        ))}
        {otherEvents.length === 0 && <p>Nessun altro evento per ora ;(</p>}
      </section>
    </main>
  );
}
