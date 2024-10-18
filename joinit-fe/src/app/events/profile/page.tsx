'use client';
import React, { useEffect, useState } from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import Image from 'next/image';
import axios from 'axios';
import { AppRoutes } from '@/enums/AppRoutes';

const url = process.env.API_URL;

export default function ProfilePage() {
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
      <div className="flex items-center justify-start mb-8">
        <Image
          src="https://via.placeholder.com/50"
          width={50}
          height={50}
          
          alt="Profile"
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div>
          <h1 className="text-4xl font-bold">Name</h1>
          <p className="text-gray-600">19 anni</p>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4">I Tuoi Eventi</h2>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {myEvents.map(event => (
          <EventCard
          key={event.id}
          title={event.name}
          desc={event.description}
          date={new Date(event.event_date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + new Date(event.event_date).toLocaleTimeString('it-IT', { hour: 'numeric', minute: '2-digit' })}
          location={event.place}
          canJoin={false}
          url={AppRoutes.EVENT + event.id} />
        ))}
      </section>
    </main>
  );
}
