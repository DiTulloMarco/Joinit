'use server';
import React from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';

export default async function MyEventsPage() {
  const myEvents: MyEvent[] = [
    { id: 1, name: "Evento 1", description: "Descrizione dell'evento 1", event_date: "2024-08-23", place: "Roma" },
    { id: 2, name: "Evento 2", description: "Descrizione dell'evento 2", event_date: "2024-09-01", place: "Milano" },
  ];

  return (
    <main className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-8">I Tuoi Eventi</h1>
      <section className="grid grid-cols-1 gap-6">
        {myEvents.map(event => (
          <EventCard key={event.id} title={event.name} desc={event.description} date={event.event_date} location={event.place} canJoin={true} />
        ))}
      </section>
    </main>
  );
}
