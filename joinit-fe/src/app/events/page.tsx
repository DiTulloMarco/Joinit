'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '@components/EventCard';
import { MyEvent } from '@/types/MyEvent';

const url = process.env.API_URL;

export default function EventsPage() {
  const [featuredEvent, setFeaturedEvent] = useState<MyEvent | null>(null);
  const [otherEvents, setOtherEvents] = useState<MyEvent[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const userId = sessionStorage.getItem('userId');

  const fetchEvents = async (page: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/events/list_public/`, { params: { page, userId } });
      setFeaturedEvent(response.data.results[0]);
      setOtherEvents(response.data.results.slice(1));
      setTotalPages(Math.ceil(response.data.count / 10));
    } catch (error) {
      console.error('Errore durante il fetch degli eventi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="flex-1 p-8">
      <h2 className="text-3xl font-bold mb-4">In Primo Piano</h2>
      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <>
          {featuredEvent ? (
            <EventCard
              event={featuredEvent}
              canJoin={!featuredEvent.joined_by.includes(parseInt(sessionStorage.getItem('userId') || '0'))}
              canInteract={true}
            />
          ) : (
            <p>Nessun evento in primo piano</p>
          )}
          <h2 className="text-2xl font-bold mb-4 flex items-center pt-10">
            Altri Eventi
            <span className="material-icons text-lg ml-2">arrow_forward</span>
          </h2>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {otherEvents.length > 0 ? (
              otherEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  canJoin={!event.joined_by.includes(parseInt(sessionStorage.getItem('userId') || '0'))}
                  canInteract={true}
                />
              ))
            ) : (
              <p>Nessun altro evento per ora ;(</p>
            )}
          </section>
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => goToPage(index + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === index + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              &gt;
            </button>
          </div>
        </>
      )}
    </main>
  );
}
