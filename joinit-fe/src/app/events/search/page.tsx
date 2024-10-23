'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import { AppRoutes } from '@/enums/AppRoutes';

const url = process.env.API_URL

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<MyEvent[]>([]);
  const [error, setError] = useState<string>("Nessun evento per ora ;(");
  
  async function fetchDefaultEvents() {
    try {
      const response = await axios.get(`${url}/events/list_public/`);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => { 
    fetchDefaultEvents();
  }, []);
  
  async function fetchSearchResults() {
    try {
      const response = await axios.get(`${url}/events/search/?q=${searchQuery}`);
      console.log(response.data.results);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => { 
    if (searchQuery) {
      fetchSearchResults();
      setError("Nessun trovato ;(");
    }else{
      fetchDefaultEvents();
      setError("Nessun evento per ora ;(");
    }
  }, [searchQuery]);

  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <EventCard 
          key={event.id}
          event={event} 
          canJoin={!event.joined_by.includes(parseInt(sessionStorage.getItem('userId')!))} 
        />
        ))}
        {searchResults.length === 0 && <p>{error}</p>}
      </section>
    </main>
  );
}
