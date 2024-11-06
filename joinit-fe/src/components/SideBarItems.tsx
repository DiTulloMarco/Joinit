"use client";

import { AppRoutes } from '@/enums/AppRoutes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
type Props = {
    textClass: string;
    toggleMenu: () => void;
};

const SideBarItems = [
    {
        name: "Crea Evento",
        url: AppRoutes.CREATE_EVENT,
        icon: "add_circle"
    },
    {
        name: "Esplora",
        url: AppRoutes.EVENTS,
        icon: "explore"
    },
    {
        name: "Cerca",
        url: AppRoutes.SEARCH,
        icon: "search"
    },
    {
        name: "I Tuoi Eventi",
        url: AppRoutes.MY_EVENTS,
        icon: "event"
    },
    {
        name: "Il Tuo Profilo",
        url: AppRoutes.MY_PROFILE,
        icon: "person"
    }
]

export default function SidebarItems(props: Props) {
    const pathname = usePathname();
  return (
    <nav className="flex flex-col space-y-8 mt-8">
        {
        SideBarItems.map((item) => (
            item.url !== pathname ? (
                <Link key={item.name} href={item.url} className={`flex items-center space-x-2 ${props.textClass} p-2 rounded`}>
                    <span className="material-icons">{item.icon}</span>
                    <span className="text-md">{item.name}</span>
                </Link>
        ) : (
            <Link key={item.name} href={item.url} onClick={props.toggleMenu} className={`flex items-center space-x-2 ${props.textClass} p-2 rounded`}>
                <span className="material-icons">{item.icon}</span>
                <span className="text-md">{item.name}</span>
            </Link>
        )
        ))}
    </nav>
    
  );
}
