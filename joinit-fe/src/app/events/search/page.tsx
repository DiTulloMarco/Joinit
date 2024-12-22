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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastSearchParams, setLastSearchParams] = useState({});
const [totalPages, setTotalPages] = useState<number>(1);
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

  const fetchEvents = async (endpoint: string, params = {}) => {
    setIsLoading(true);
    const userId = sessionStorage.getItem('userId');
    try {
      const response = await axios.get(endpoint, {
        params: { ...params, page: currentPage ,userId: userId},
      });
      setSearchResults(response.data.results || []);
      setTotalPages(Math.ceil(response.data.count / 10));
      setError("");
    } catch (error) {
      console.error("Errore durante il caricamento degli eventi:", error);
      setError("Errore durante il caricamento degli eventi.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const params = { ...lastSearchParams, page: currentPage };
    fetchEvents(`${url}/events/search/`, params);
}, [currentPage]);

  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchSearchResults = () => {
    const params = { q: searchQuery, page: 1 };
    setCurrentPage(1);
    setLastSearchParams(params);
    fetchEvents(`${url}/events/search/`, params);
  };

  const fetchAdvancedSearchResults = () => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    const params = Object.fromEntries(queryParams);
    params.page = String(1);
    setCurrentPage(1);
    setLastSearchParams(params);
    fetchEvents(`${url}/events/search/`, params);
    setShowAdvancedFilters(false);
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
          className="w-full p-4 border border-gray-300 rounded-full bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
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
          <div className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
            <h2 className="text-2xl font-bold mb-4">Filtri Avanzati</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Nome</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="w-full p-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  placeholder="Nome dell'evento"
                />
              </div>

              <div>
                <label className="block mb-1">Luogo</label>
                <input
                  type="text"
                  value={filters.place}
                  onChange={(e) => setFilters({ ...filters, place: e.target.value })}
                  className="w-full p-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  placeholder="Luogo"
                />
              </div>

              <div>
                <label className="block mb-1">Categoria</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full p-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
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
                  className="w-full p-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  placeholder="Prezzo massimo"
                />
              </div>

              <div>
                <label className="block mb-1">Numero massimo di partecipanti</label>
                <input
                  type="number"
                  value={filters.max_participants}
                  onChange={(e) => setFilters({ ...filters, max_participants: e.target.value })}
                  className="w-full p-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  placeholder="Numero massimo di partecipanti"
                />
              </div>

              <div>
                <label className="block mb-1">Tags</label>
                <input
                  type="text"
                  value={filters.tags}
                  onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                  className="w-full p-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
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
      <>
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
    ) : (
      <p className="text-center text-gray-500">{error}</p>
    )}
    </main>
  );
}
