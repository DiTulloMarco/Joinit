import Link from 'next/link';
import React from 'react';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 p-4 shadow fixed w-full top-0 left-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <img 
              src="/images/LOGO.webp" 
              alt="JoinIt Logo" 
              className="h-10 w-auto" // Logo size
            />
            <span className="text-gray-800 dark:text-white text-lg font-bold">JoinIt</span> {}
          </div>
        </Link>
        <div className="flex space-x-4 items-center">
          <Link href="/login" className="text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300">
            Login
          </Link>
          <Link href="/register" className="text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300">
            Register
          </Link>
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
}
