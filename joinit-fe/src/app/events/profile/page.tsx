'use server';
import React from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import Image from 'next/image';

export default async function ProfilePage() {
  const userEvents: MyEvent[] = [
    { id: 1, name: "Evento Partecipato 1", description: "Evento a cui hai partecipato", event_date: "2024-08-15", place: "Bologna" },
    { id: 2, name: "Evento Partecipato 2", description: "Altro evento a cui hai partecipato", event_date: "2024-09-05", place: "Firenze" },
  ];

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
        {userEvents.map(event => (
          <EventCard key={event.id} title={event.name} desc={event.description} date={event.event_date} location={event.place} canJoin={false} />
        ))}
      </section>
    </main>
  );
}
