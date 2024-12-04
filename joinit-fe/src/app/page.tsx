'use server';
import React from 'react';
import Navbar from '../components/Navbar';
import Image from 'next/image';

export default async function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300 pt-16">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-800 text-center py-20 rounded-md mx-6 mt-6 flex flex-col items-center transition-colors duration-300">
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/images/LOGO.webp" 
            width={150}
            height={150}
            alt="JoinIt Logo" 
            className="w-32 h-32 mr-4" // Logo size
          />
          <h1 className="text-5xl font-extrabold text-gray-800 dark:text-gray-100">Benvenuto su JoinIt</h1>

        </div>
        <p className="text-2xl text-indigo-600 dark:text-indigo-400 mt-4 font-bold tracking-wide shadow-sm hover:text-indigo-700 transition-colors">Crea e partecipa agli eventi più coinvolgenti</p>
        <div className="w-1/4 mt-8 flex justify-center">
          <input
            type="email"
            placeholder="you@example.com"
            className="primary-input !rounded-r-none"
          />
          <button 
            type="submit"
            className="primary-button !w-1/2 !mt-1 !rounded-l-none !px-0"
          >
            Registrati
          </button>
        </div>
      </section>

      {/* Image Grid Section */}
      <section className="container mx-auto py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
        {(() => {
          const images = ['landpage1.jpg', 'landpage2.jpg', 'landpage1.jpg', 'landpage1.jpg', 'landpage1.jpg',  'landpage1.jpg'];
          const elements = [];
          for (let i = 0; i < images.length; i++) {
            elements.push(
              <div
                key={i}
                className="relative overflow-hidden rounded-md shadow-lg hover:scale-105 transform transition-transform"
              >
                <Image
                  src={`/images/${images[i]}`}
                  width={300}
                  height={300}
                  alt={`Evento ${i + 1}`}
                  className="object-cover w-full h-full rounded-md"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-lg font-semibold">
                    Evento {i + 1}
                  </span>
                </div>
              </div>
            );
          }
          return elements;
        })()}
      </section>
    </div>
  );
}
