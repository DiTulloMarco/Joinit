'use server';
import React from 'react';
import { MyEvent } from '@types';
import EventCard from '@components/EventCard';

export default async function EventPage() {
  const eventDetails: MyEvent = {
    id: 1,
    title: "Evento Dettagliato",
    desc: "Descrizione dettagliata dell'evento",
    date: "2024-08-23",
    location: "Roma, quartiere Tuscolano",
  };

  const comments = [
    {
      id: 1,
      author: "Alberto",
      date: "24/07/2024",
      content: "Ottimo evento, mi sono divertito molto!",
      rating: 4.5,
    },
    {
      id: 2,
      author: "Giulia",
      date: "25/07/2024",
      content: "Evento ben organizzato, consiglio di partecipare!",
      rating: 4.0,
    },
  ];

  return (
    <main className="flex-1 p-8">
      <h2 className="text-3xl font-bold mb-4">{eventDetails.title}</h2>
      <EventCard
        title={eventDetails.title}
        desc={eventDetails.desc}
        date={eventDetails.date}
        location={eventDetails.location}
      />

      <section className="mt-12">
        <h3 className="text-2xl font-bold mb-4">Commenti</h3>
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="p-4 border rounded-lg bg-white shadow-md">
              <div className="flex items-center space-x-2">
                <p className="text-gray-800 font-semibold">{comment.author}</p>
                <div className="text-yellow-500 flex items-center">
                  {[...Array(Math.floor(comment.rating))].map((_, i) => (
                    <span key={i} className="material-icons">star</span>
                  ))}
                  {comment.rating % 1 !== 0 && <span className="material-icons">star_half</span>}
                </div>
                <p className="text-gray-500 text-sm ml-4">{comment.date}</p>
              </div>
              <p className="text-gray-700 mt-2">{comment.content}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
