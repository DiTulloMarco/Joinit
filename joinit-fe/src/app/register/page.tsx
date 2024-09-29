import React from 'react';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100 dark:from-gray-800 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">Registrati</h1>
        <form className="space-y-6">
          {['first_name', 'last_name', 'email', 'password', 'password_confirmation'].map((field, index) => (
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
            type="submit"
            className="w-full py-2 mt-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Registrati
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Hai già un account?</p>
          <a
            href="/login"
            className="inline-block mt-2 text-purple-600 dark:text-purple-400 hover:underline"
          >
            Accedi
            </a>
        </div>
        <div className="text-center mt-6">
          <a href="/" className="w-full flex justify-center py-2 px-4 border border-gray-400 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2">
            Torna alla Home
          </a>
        </div>
      </div>
    </div>
  );
}
