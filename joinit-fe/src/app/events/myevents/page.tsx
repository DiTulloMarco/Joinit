'use server';
import React from 'react';
import { MyEvent } from '@types';
import EventCard from '@components/EventCard';

export default async function MyEventsPage() {
  const myEvents: MyEvent[] = [
    { id: 1, title: "Evento 1", desc: "Descrizione dell'evento 1", date: "2024-08-23", location: "Roma" },
    { id: 2, title: "Evento 2", desc: "Descrizione dell'evento 2", date: "2024-09-01", location: "Milano" },
  ];

  return (
    <main className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-8">I Tuoi Eventi</h1>
      <section className="grid grid-cols-1 gap-6">
        {myEvents.map(event => (
          <EventCard key={event.id} title={event.title} desc={event.desc} date={event.date} location={event.location} canJoin={true} />
        ))}
      </section>
    </main>
  );
}
