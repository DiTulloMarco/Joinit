'use server';
import React from 'react';
import { MyEvent } from '@types';
import EventCard from '@components/EventCard';
import Image from 'next/image';

export default async function ProfilePage() {
  const userEvents: MyEvent[] = [
    { id: 1, title: "Evento Partecipato 1", desc: "Evento a cui hai partecipato", date: "2024-08-15", location: "Bologna" },
    { id: 2, title: "Evento Partecipato 2", desc: "Altro evento a cui hai partecipato", date: "2024-09-05", location: "Firenze" },
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
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userEvents.map(event => (
          <EventCard key={event.id} title={event.title} desc={event.desc} date={event.date} location={event.location} canJoin={false} />
        ))}
      </section>
    </main>
  );
}
