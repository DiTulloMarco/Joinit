'use client';
import React, { useState, useEffect } from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import axios from 'axios';

const url = process.env.API_URL;

export default function MyEventsPage() {
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchEvents = async (page: number) => {
    try {
      setIsLoading(true);
  
      const [createdResponse, joinedResponse] = await Promise.all([
        axios.get(`${url}/users/auth/user_events/`, {
          params: { page },
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        }),
        axios.get(`${url}/users/auth/joined_events_past/`, {
          params: { page },
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        }),
      ]);

      const combinedEvents = [
        ...(createdResponse.data.results || []),
        ...(joinedResponse.data.results || []),
      ];
      const uniqueEvents = Array.from(
        new Map(combinedEvents.map((event) => [event.id, event])).values()
      )
        .filter(event => !event.cancelled || event.created_by === parseInt(sessionStorage.getItem('userId')!))  // Mostra cancellati solo se creati da te
        .sort((a, b) => new Date(a.updated_at).getTime() < new Date(b.updated_at).getTime() ? 1 : -1);
      
  
      setMyEvents(uniqueEvents);
      setTotalPages(Math.ceil(uniqueEvents.length / 10));
      setHasError(false);
    } catch (error) {
      console.error('Errore durante il fetch degli eventi:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
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
      <h1 className="text-3xl font-bold mb-8">I Tuoi Eventi</h1>

      {isLoading ? (
        <p className="text-center text-gray-500">Caricamento in corso...</p>
      ) : hasError ? (
        <p className="text-center text-red-500">
          Si è verificato un errore durante il caricamento degli eventi.
        </p>
      ) : myEvents.length > 0 ? (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {myEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                canJoin={!event.joined_by.includes(parseInt(sessionStorage.getItem('userId')!))}
                canInteract={true}
              />
            ))}
          </section>

          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
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
                currentPage === totalPages
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              &gt;
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">
          Non hai creato nessun evento, vai e organizza anche tu un evento, sei ancora in tempo anche se sei quasi Ingegnere.
        </p>
      )}
    </main>
  );
}
