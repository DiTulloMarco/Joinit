import React from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 pt-16">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gray-200 dark:bg-gray-800 text-center py-20">
        <h1 className="text-4xl font-bold">Title</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">Subtitle</p>
        <div className="mt-8">
          <input
            type="email"
            placeholder="you@example.com"
            className="px-4 py-2 rounded-l-md border border-gray-300 dark:border-gray-600"
          />
          <button className="bg-gray-800 dark:bg-gray-600 text-white px-4 py-2 rounded-r-md">
            Submit
          </button>
        </div>
      </section>

      {/* Image Grid Section */}
      <section className="container mx-auto py-12 grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-md flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">Image Placeholder</span>
        </div>
        <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-md flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">Image Placeholder</span>
        </div>
        <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-md flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">Image Placeholder</span>
        </div>
        <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-md flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">Image Placeholder</span>
        </div>
        <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-md flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">Image Placeholder</span>
        </div>
        <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-md flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">Image Placeholder</span>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gray-200 dark:bg-gray-800 text-center py-16">
        <h2 className="text-3xl font-bold">Vivi un’esperienza unica</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <Link href="/register" className="bg-gray-800 dark:bg-gray-600 text-white px-6 py-3 mt-8 rounded inline-block">
          Register
        </Link>
      </section>
    </div>
  );
}
