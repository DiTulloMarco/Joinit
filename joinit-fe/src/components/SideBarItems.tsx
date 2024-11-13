"use client";

import { AppRoutes } from '@/enums/AppRoutes';
import { AuthContext } from '@/hooks/authContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useContext } from 'react';
type Props = {
    textClass: string;
    selectedClass: string;
    toggleMenu: () => void;
};

const SideBarItems = [
    {
        id: 1,
        name: "Crea Evento",
        url: AppRoutes.CREATE_EVENT,
        icon: "add_circle"
    },
    {
        id: 2,
        name: "Esplora",
        url: AppRoutes.EVENTS,
        icon: "explore"
    },
    {
        id: 3,
        name: "Cerca",
        url: AppRoutes.SEARCH,
        icon: "search"
    },
    {
        id: 4,
        name: "I Tuoi Eventi",
        url: AppRoutes.MY_EVENTS,
        icon: "event"
    },
    {
        id: 5,
        name: "Il Tuo Profilo",
        url: AppRoutes.MY_PROFILE,
        icon: "person"
    }
]

export default function SidebarItems(props: Props) {
    const pathname = usePathname();
    const { logout } = useContext(AuthContext);

  return (
    <nav className="flex flex-col space-y-8 mt-8">
        <Link href={AppRoutes.LOGIN} onClick={logout} className="flex items-center space-x-1">
            <span className="material-icons">logout</span>
            <span className="text-md">Logout</span>
        </Link>
        {
        SideBarItems.map((item) => (
            item.url !== pathname ? (
                <Link href={item.url} key={item.id} className={`flex items-center space-x-2 ${props.textClass} p-2 px-4 rounded-lg`}>
                    <span className="material-icons">{item.icon}</span>
                    <span className="text-md">{item.name}</span>
                </Link>
        ) : (
            <Link href={item.url} key={item.id} onClick={props.toggleMenu} className={`flex items-center space-x-2 ${props.selectedClass} p-2 px-4 rounded-lg`}>
                <span className="material-icons">{item.icon}</span>
                <span className="text-md">{item.name}</span>
            </Link>
        )
        ))}
    </nav>
    
  );
}
