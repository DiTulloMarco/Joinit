"use client";

import Link from 'next/link';
import React from 'react';
import DarkModeToggle from './DarkModeToggle';
import SidebarItems from './SideBarItems';

export default function Sidebar() {
  return (
    <aside className="hidden p-4 bg-white shadow-lg md:flex flex-col justify-between left-0 top-0 min-h-screen dark:bg-gray-900">
      <div className="mt-8 text-gray-700 dark:text-gray-300">
        <SidebarItems toggleMenu={() => {}} textClass='hover:bg-gray-200 dark:hover:bg-gray-800' />
      </div>
      <div className="mt-8">
        <DarkModeToggle />
      </div>
    </aside>
    
  );
}
