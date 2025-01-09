'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '@components/Sidebar';
import AuthLoader from '@/hooks/authLoader';
import SidebarItems from '@/components/SideBarItems';
import { usePathname } from 'next/navigation';
import DarkModeToggle from '@/components/DarkModeToggle';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname()

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname])

  return (
    <AuthLoader>
      <div className="flex w-screen">
        {menuOpen && 
          <div className="flex flex-col h-screen">
            <div className='fixed inset-0 bg-gray-900 bg-opacity-90 z-40'>
              <div className="h-full w-full mt-8 md:hidden z-50 fixed text-gray-100 text-3xl dark:text-gray-300">
              <button onClick={toggleMenu} className="flex items-center space-x-2 dark:hover:bg-gray-800 p-2 rounded md:hidden">
                  {menuOpen &&<span className="material-icons">close</span>}
                </button>
                <div className="h-1/2 w-full flex items-center justify-center ">
                <SidebarItems toggleMenu={toggleMenu} textClass='hover:text-purple-600' selectedClass='bg-gray-800' />
                </div>
              </div>
            </div>
            <div className="fixed bottom-0 mt-auto mb-6 z-40">
              <DarkModeToggle />
            </div>
          </div>
        }
        {!menuOpen &&
        <div className="mt-8 md:hidden bg-transparent z-50 fixed text-gray-700 dark:text-gray-300">
          <button onClick={toggleMenu} className="flex items-center space-x-2 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded md:hidden">
            <span className="material-icons">menu</span>
          </button>
        </div>}

        <Sidebar />
        <main className="flex-1 p-8 bg-gray-100 dark:bg-gray-800 min-h-screen text-gray-800 dark:text-gray-200">
          {children}
        </main>
      </div>
    </AuthLoader>
  );
};

export default DashboardLayout;
