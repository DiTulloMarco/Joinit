import React from 'react';
import { MioEvent } from '@types';
import EventCard from '@components/EventCard';

export default function ExplorePage() {
  const featuredEvent: MioEvent = {
    id: 1,
    title: "Evento in Primo Piano",
    desc: "Un evento molto interessante",
    date: "2024-08-30",
    location: "Napoli",
  };

  const otherEvents: MioEvent[] = [
    { id: 2, title: "Evento 2", desc: "Un altro evento da non perdere", date: "2024-09-05", location: "Firenze" },
    { id: 3, title: "Evento 3", desc: "Evento 3 molto interessante", date: "2024-09-10", location: "Torino" },
  ];

  return (
    <main className="flex-1 p-8">
      <h2 className="text-3xl font-bold mb-4">In Primo Piano</h2>
      <EventCard title={featuredEvent.title} desc={featuredEvent.desc} date={featuredEvent.date} location={featuredEvent.location} />

      <h2 className="text-2xl font-bold mb-4 flex items-center">
        Altri Eventi
        <span className="material-icons text-lg ml-2">arrow_forward</span>
      </h2>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {otherEvents.map(event => (
          <EventCard key={event.id} title={event.title} desc={event.desc} date={event.date} location={event.location} />
        ))}
      </section>
    </main>
  );
}
