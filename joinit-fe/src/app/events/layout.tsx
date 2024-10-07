'use client';
import React from 'react';
import Sidebar from '@components/Sidebar';
import AuthLoader from '@/hooks/authLoader';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthLoader>
      <div className="flex">
        <Sidebar />
        <main className="ml-[16.67%] w-full p-8 bg-gray-100 dark:bg-gray-800 min-h-screen text-gray-800 dark:text-gray-200">
          {children}
        </main>
      </div>
    </AuthLoader>
  );
};

export default DashboardLayout;
