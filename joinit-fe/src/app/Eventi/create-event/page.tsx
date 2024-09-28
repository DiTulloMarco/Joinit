import React from 'react';

export default function CreateEventPage() {
  return (
    <main className="flex-1 p-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Crea un Nuovo Evento</h1>
      <form className="space-y-6">
        <div>
          <label 
            htmlFor="eventName" 
            className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
          >
            Nome dell'Evento
          </label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Inserisci il nome dell'evento"
          />
        </div>

        <div>
          <label 
            htmlFor="eventDate" 
            className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
          >
            Data
          </label>
          <input
            type="date"
            id="eventDate"
            name="eventDate"
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label 
            htmlFor="eventTime" 
            className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
          >
            Orario
          </label>
          <input
            type="time"
            id="eventTime"
            name="eventTime"
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label 
            htmlFor="eventLocation" 
            className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
          >
            Luogo
          </label>
          <input
            type="text"
            id="eventLocation"
            name="eventLocation"
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Inserisci il luogo dell'evento"
          />
        </div>

        <div>
          <label 
            htmlFor="eventDescription" 
            className="block text-gray-700 dark:text-gray-300 font-bold mb-2"
          >
            Descrizione
          </label>
          <textarea
            id="eventDescription"
            name="eventDescription"
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Inserisci una descrizione dell'evento"
          ></textarea>
        </div>

        <button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white p-3 rounded-md"
        >
          Crea Evento
        </button>
      </form>
    </main>
  );
}
