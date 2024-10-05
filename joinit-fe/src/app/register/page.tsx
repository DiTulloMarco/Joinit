'use server';
import React from 'react';

export default async function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:from-gray-800 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg w-96">
        <form className="space-y-6">
          {['nome', 'cognome', 'email', 'password', 'conferma_password'].map((field, index) => (
            <div key={index}>
              <label htmlFor={field} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </label>
              <input
                type={field.includes('password') ? 'password' : 'text'}
                id={field}
                name={field}
                placeholder={field.includes('password') ? '********' : `Inserisci il tuo ${field.replace('_', ' ')}`}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
          ))}
          <button 
           className="w-full flex justify-center py-2 px-4 border border-gray-400 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
          >
            Registrati
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 pb-2">Hai già un account?</p>
        </div>
        <div
           className="w-full flex justify-center py-2 px-4 border border-gray-400 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
          >
            <a href="/login" >
              Accedi
            </a>
        </div>
      </div>
    </div>
  );
}
