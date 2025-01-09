import Link from 'next/link';
import React from 'react';
import DarkModeToggle from './DarkModeToggle';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 p-4 shadow fixed w-full top-0 left-0 z-50 transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/images/LOGO.webp" 
            width={40}
            height={40}
            alt="JoinIt Logo" 
            className="h-10 w-auto" // Logo size
          />
          <span className="text-gray-800 dark:text-white text-lg font-bold">
            JoinIt
          </span>
        </Link>

        <div className="flex space-x-6 items-center">
          <Link 
            href="/login" 
            className="text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Login"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Register"
          >
            Register
          </Link>
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
}
