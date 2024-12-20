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
  const [userData, setUserData] = useState<User | null>(null);
  const [userEvents, setUserEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);

  const authenticatedUserId = parseInt(sessionStorage.getItem('userId')!, 10);

  useEffect(() => {
    if (userId && parseInt(userId) === authenticatedUserId) {
      router.replace('/events/profile');
    }
  }, [userId, authenticatedUserId, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userResponse, eventsResponse] = await Promise.all([
        axios.get(`${url}/users/${userId}/`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        }),
        axios.get(`${url}/users/${userId}/get_user_events/`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        }),
      ]);

      setUserData(userResponse.data);

      const filteredEvents = eventsResponse.data.results.filter((event: MyEvent) => {
        const isParticipant = event.joined_by.includes(authenticatedUserId);
        return (!event.is_private || isParticipant) && !event.cancelled;
      });

      setUserEvents(filteredEvents);
      setUserNotFound(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setUserNotFound(true);
      } else {
        console.error('Errore sconosciuto:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="flex justify-center items-center h-full">
          <div className="loader"></div>
        </div>
      </main>
    );
  }

  if (userNotFound) {
    return (
      <main className="flex-1 p-8 text-center">
        <p className="text-red-600 text-xl font-bold">
          Droide non trovato. Questi non sono i droidi che state cercando.
        </p>
        <button
          onClick={() => router.push('/events/profile')}
          className="primary-button mt-4"
        >
          Vai al tuo profilo
        </button>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      {userData && (
        <div className="flex items-center justify-start mb-8">
          <Image
            src={userData.profile_picture || 'https://via.placeholder.com/160'}
            width={160}
            height={160}
            alt="Profile"
            className="w-40 h-40 rounded-lg border-4 border-gray-300 shadow-lg mr-6"
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

      <h2 className="text-2xl font-bold mb-4">Eventi Creati da {userData?.first_name}</h2>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {userEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            canJoin={!event.joined_by.includes(authenticatedUserId)}
            canInteract={true}
          />
        ))}
      </section>
    </main>
  );
}
