"use client";

import Link from 'next/link';
import React from 'react';
import DarkModeToggle from './DarkModeToggle';

export default function Sidebar() {
  return (
    <aside className="w-1/6 p-4 bg-white shadow-lg flex flex-col justify-between fixed left-0 top-0 min-h-screen dark:bg-gray-900">
      <div className="mt-8 text-gray-700 dark:text-gray-300">
        {/* Event Creation Icon */}
        <Link href="/events/create-event" className="flex items-center space-x-2 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded">
          <span className="material-icons">add_circle</span>
          <span className="text-md">Crea Evento</span>
        </Link>
        <nav className="flex flex-col space-y-4 mt-8">
          <Link href="/events" className="flex items-center space-x-2 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded">
            <span className="material-icons">explore</span>
            <span className="text-md">Esplora</span>
          </Link>
          <Link href="/events/search" className="flex items-center space-x-2 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded">
            <span className="material-icons">search</span>
            <span className="text-md">Cerca</span>
          </Link>
          <Link href="/events/myevents" className="flex items-center space-x-2 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded">
            <span className="material-icons">event</span>
            <span className="text-md">I Tuoi Eventi</span>
          </Link>
          <Link href="/events/profile" className="flex items-center space-x-2 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded">
            <span className="material-icons">person</span>
            <span className="text-md">Il Tuo Profilo</span>
          </Link>
        </nav>
      </div>
      <div className="mt-8">
        <DarkModeToggle />
      </div>
    </aside>
  );
}
