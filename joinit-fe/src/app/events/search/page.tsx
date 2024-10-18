'use server';
import React from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';

export default async function SearchPage() {
  const searchResults: MyEvent[] = [
    { id: 1, name: "Evento 1", description: "Un evento interessante trovato tramite ricerca", event_date: "2024-08-23", place: "Roma" },
    { id: 2, name: "Evento 2", description: "Altro evento trovato tramite ricerca", event_date: "2024-09-01", place: "Milano" },
    { id: 3, name: "Evento 3", description: "Un altro evento rilevante", event_date: "2024-09-10", place: "Torino" },
  ];

  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Titolo dell'evento"
            className="w-full p-4 border border-gray-300 rounded-full"
          />
          <span className="material-icons absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            search
          </span>
        </div>
      </div>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {searchResults.map(event => (
          <EventCard key={event.id} title={event.name} desc={event.description} date={event.event_date} location={event.place} canJoin={true} />
        ))}
      </section>
    </main>
  );
}
