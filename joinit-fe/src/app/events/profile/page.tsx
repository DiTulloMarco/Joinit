'use client';
import React, { useEffect, useState } from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import Image from 'next/image';
import axios from 'axios';
import { AppRoutes } from '@/enums/AppRoutes';
import { User } from '@/types/User';

const url = process.env.API_URL;

export default function ProfilePage() {
  const [userData, setUserData] = useState<User>({} as User);
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  
  async function fetchUser() {
    try{

      const id = sessionStorage.getItem('userId');
      const response = await axios.get(`${url}/users/${id}/`);
      setUserData(response.data);
      console.log(response.data); 
    }catch{
      throw new Error('Failed to fetch user data');
    }
  }

  async function fetchEvents() {
    try{
      const id = sessionStorage.getItem('userId');
      const response = await axios.get(`${url}/users/${id}/get_user_events/`);
      setMyEvents(response.data.results);
      console.log(response.data.results);
    }catch{
      throw new Error('Failed to fetch user data');
    }
  }


  useEffect(() => { 
    fetchUser();
    fetchEvents();
  }, []);

  return (
    <main className="flex-1 p-8">
      {!userData && <p>Loading user data...</p>}
      {userData &&
        <>
          <div className="flex items-center justify-start mb-8">
            <Image
              src={userData.profile_picture ? userData.profile_picture : "https://via.placeholder.com/50"}
              width={50}
              height={50}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover mr-4"
            />
            <div>
              <h1 className="text-4xl font-bold">{userData.first_name} {userData.last_name}</h1>
              <p className="text-gray-600">
                {userData.birth_date &&
                  Math.floor((new Date().getTime() - new Date(userData.birth_date).getTime()) / 31557600000)
                }
              </p>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">I Tuoi Eventi</h2>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myEvents.map(event => (
              <EventCard
              key={event.id}
              title={event.name}
              desc={event.description}
              date={new Date(event.event_date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + new Date(event.event_date).toLocaleTimeString('it-IT', { hour: 'numeric', minute: '2-digit' })}
              location={event.place}
              canJoin={false}
              url={AppRoutes.EVENT + event.id} />
            ))}
          </section>
        </>
      }
    </main>
  );
}
