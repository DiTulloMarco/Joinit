"use client";

import React, { useState, useEffect } from 'react';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <button 
      onClick={() => setDarkMode(!darkMode)} 
      className="p-2 bg-gray-300 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100">
      {darkMode ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
    </button>
  );
}
