import React from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200 pt-16">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-800 text-center py-20 shadow-lg rounded-md mx-6 mt-6 flex flex-col items-center">
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/images/LOGO.webp" 
            alt="JoinIt Logo" 
            className="w-32 h-32 mr-4" //Logo size
          />
          <h1 className="text-5xl font-extrabold text-gray-800 dark:text-gray-100">Benvenuto su Joinit</h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">Crea e partecipa agli eventi più coinvolgenti</p>
        <div className="mt-8 flex justify-center">
          <input
            type="email"
            placeholder="you@example.com"
            className="px-4 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 focus:outline-none dark:bg-gray-700 dark:text-gray-100"
          />
          <button className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-r-md hover:bg-blue-700 transition">
            Iscriviti
          </button>
        </div>
      </section>

      {/* Image Grid Section */}
      <section className="container mx-auto py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
        {['landpage1.jpg', 'landpage1.jpg','landpage1.jpg', 'landpage1.jpg','landpage1.jpg', 'landpage1.jpg',].map((image, index) => (
          <div key={index} className="relative overflow-hidden rounded-md shadow-lg hover:scale-105 transform transition-transform">
            <img src={`/images/${image}`} alt={`Evento ${index + 1}`} className="object-cover w-full h-full rounded-md" />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-lg font-semibold">Evento {index + 1}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
