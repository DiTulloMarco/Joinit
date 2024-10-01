import React from 'react';
import { MioEvent } from '@types';
import EventCard from '@components/EventCard';

export default function SearchPage() {
  const searchResults: MioEvent[] = [
    { id: 1, title: "Evento 1", desc: "Un evento interessante trovato tramite ricerca", date: "2024-08-23", location: "Roma" },
    { id: 2, title: "Evento 2", desc: "Altro evento trovato tramite ricerca", date: "2024-09-01", location: "Milano" },
    { id: 3, title: "Evento 3", desc: "Un altro evento rilevante", date: "2024-09-10", location: "Torino" },
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
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {searchResults.map(event => (
          <EventCard key={event.id} title={event.title} desc={event.desc} date={event.date} location={event.location} />
        ))}
      </section>
    </main>
  );
}
