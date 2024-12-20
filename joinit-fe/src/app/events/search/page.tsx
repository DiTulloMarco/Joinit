'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';

const url = process.env.API_URL

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<MyEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("Nessun evento per ora ;(");

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false); 
  const [filters, setFilters] = useState({
    name: '',
    place: '',
    category: '',
    max_price: '',
    max_participants: '',
    tags: '',
  });

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${url}/events/event_types/`);
      setCategories(response.data.map((v: string, i: number) => ({ id: i, name: v })));
    } catch (error) {
      console.error('Errore durante il caricamento delle categorie:', error);
    }
  };

  const fetchDefaultEvents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${url}/events/list_public/`);
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error('Errore nel caricamento degli eventi predefiniti:', error);
      setError('Errore durante il caricamento degli eventi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchDefaultEvents();
  }, []);

  const fetchSearchResults = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${url}/events/search/?q=${searchQuery}`);
      setSearchResults(response.data.results || []);
      setError("");
    } catch (error) {
      console.error('Errore nella ricerca semplice:', error);
      setError('Errore durante la ricerca.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdvancedSearchResults = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();

      if (filters.name) queryParams.append('name', filters.name);
      if (filters.place) queryParams.append('place', filters.place);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.max_price) queryParams.append('max_price', filters.max_price);
      if (filters.max_participants) queryParams.append('max_participants', filters.max_participants);
      if (filters.tags) queryParams.append('tags', filters.tags);

      const response = await axios.get(`${url}/events/search/?${queryParams.toString()}`);
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error('Errore nella ricerca avanzata:', error);
      setError('Errore durante la ricerca avanzata.');
    } finally {
      setIsLoading(false);
      setShowAdvancedFilters(false);
    }
  };

  return (
    <main className="flex-1 p-8">
      <div className="mb-4 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') fetchSearchResults();
          }}
          placeholder="Nome, categoria o tags dell'evento"
          className="w-full p-4 border border-gray-300 rounded-full"
          aria-label="Ricerca eventi"
        />
        <span className="material-icons absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          search
        </span>
      </div>

      <div className="text-center mb-4">
        <button
          onClick={() => setShowAdvancedFilters(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Filtri Avanzati
        </button>
      </div>
      {showAdvancedFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
            <h2 className="text-2xl font-bold mb-4">Filtri Avanzati</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Nome</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Nome dell'evento"
                />
              </div>

              <div>
                <label className="block mb-1">Luogo</label>
                <input
                  type="text"
                  value={filters.place}
                  onChange={(e) => setFilters({ ...filters, place: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Luogo"
                />
              </div>

              <div>
                <label className="block mb-1">Categoria</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleziona una categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Prezzo massimo</label>
                <input
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Prezzo massimo"
                />
              </div>

              <div>
                <label className="block mb-1">Numero massimo di partecipanti</label>
                <input
                  type="number"
                  value={filters.max_participants}
                  onChange={(e) => setFilters({ ...filters, max_participants: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Numero massimo di partecipanti"
                />
              </div>

              <div>
                <label className="block mb-1">Tags</label>
                <input
                  type="text"
                  value={filters.tags}
                  onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Tags separati da virgole"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowAdvancedFilters(false)} 
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Chiudi
              </button>
              <button
                onClick={fetchAdvancedSearchResults} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Applica Filtri
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-gray-500">Caricamento...</p>
      ) : searchResults.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {searchResults.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              canJoin={!event.joined_by.includes(parseInt(sessionStorage.getItem('userId')!))}
              canInteract={true}
            />
          ))}
        </section>
      ) : (
        <p className="text-center text-gray-500">{error}</p>
      )}
    </main>
  );
}
