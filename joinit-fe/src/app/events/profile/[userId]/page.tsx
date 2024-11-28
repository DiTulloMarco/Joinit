'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import { User } from '@/types/User';

const url = process.env.API_URL;

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const [userData, setUserData] = useState<User>({} as User);
  const [userEvents, setUserEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);
  const [timer, setTimer] = useState(5); 

  const authenticatedUserId = parseInt(sessionStorage.getItem('userId')!, 10);

  useEffect(() => {
    if (userId && parseInt(userId) === authenticatedUserId) {
      router.push('/events/profile');
    }
  }, [userId, authenticatedUserId, router]);

  async function fetchUserProfile() {
    try {
      const response = await axios.get(`${url}/users/${userId}/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
      setUserData(response.data);
      setUserNotFound(false); 
    } catch (error) {
      console.error('Errore nel recupero del profilo utente:', error);

      if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
        setUserNotFound(true); 
      } else {
        console.error('Errore sconosciuto:', error);
      }
    }
  }

  async function fetchUserEvents() {
    try {
      const response = await axios.get(`${url}/users/${userId}/get_user_events/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
      setUserEvents(response.data.results);
    } catch (error) {
      console.error('Errore nel recupero degli eventi:', error);
    }
  }

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchUserProfile();
    fetchUserEvents();
    setLoading(false);
  }, [userId]);

  
  useEffect(() => {
    if (userNotFound) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval); 
            router.push('/events/profile'); 
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [userNotFound, router]);

  if (loading) {
    return <p>Caricamento in corso...</p>;
  }

  if (userNotFound) {
    return (
      <main className="flex-1 p-8">
        <p className="text-red-600 text-xl font-bold">Questi non sono i droidi che state cercando.</p>
        <p className="text-red-600 text-xl font-bold">
          Tornate indietro, verrete reindirizzati alla vostra base tra <span className="font-bold">{timer}</span>...
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      {userData && (
        <div className="flex items-center justify-start mb-8">
          <Image
            src={userData.profile_picture ? userData.profile_picture : "https://via.placeholder.com/50"}
            width={80}
            height={80}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover mr-4"
          />
          <div>
            <h1 className="text-4xl font-bold">{userData.first_name} {userData.last_name}</h1>
            <p className="text-gray-600">
              {userData.birth_date &&
                Math.floor((new Date().getTime() - new Date(userData.birth_date).getTime()) / 31557600000)
              } anni - {userData.city}, {userData.nation}
            </p>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Eventi Creati da {userData.first_name}</h2>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {userEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            canJoin={!event.joined_by.includes(authenticatedUserId)}
          />
        ))}
      </section>
    </main>
  );
}
