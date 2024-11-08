'use client';
import React, { useEffect, useState } from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import Image from 'next/image';
import axios from 'axios';
import { AppRoutes } from '@/enums/AppRoutes';
import { User } from '@/types/User';
import { EditProfileFormType } from '@/types/EditProfileFormType';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { headers } from 'next/headers';

const url = process.env.API_URL;

export default function ProfilePage() {
  const [userData, setUserData] = useState<User>({} as User);
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  const [modal, setModal] = useState<boolean>(false);
  const { control, handleSubmit, formState: { errors } } = useForm<EditProfileFormType>()


  const toggleModal = () => {
    setModal(!modal);
  };
  
  async function fetchUser() {
    try{

      const id = sessionStorage.getItem('userId');
      const response = await axios.get(`${url}/users/auth/profile/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        }
      });
      setUserData(response.data);
    }catch{
      throw new Error('Failed to fetch user data');
    }
  }

  async function fetchEvents() {
    try{
      const id = sessionStorage.getItem('userId');
      const response = await axios.get(`${url}/users/auth/user_events/`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
          }
        }
      );
      setMyEvents(response.data.results);
    }catch{
      throw new Error('Failed to fetch user data');
    }
  }


  useEffect(() => { 
    fetchUser();
    fetchEvents();
  }, []);

  const onSubmit: SubmitHandler<EditProfileFormType> = async (data) => {
    try {
        const response = await axios.patch(`${url}/users/auth/profile/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
          },
          body: data
        });
        console.log(response.data);
        setUserData({...userData, ...response.data});
        toggleModal();
    } catch (error) {
        console.error(error);
        console.error('update failed');
    };
  };

  return (
    <main className="flex-1 p-8">
      {!userData && <p>Loading user data...</p>}
      {userData &&
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
              } - {userData.city}, {userData.nation}
            </p>
          </div>
          <div className='ml-11'>
            <button onClick={toggleModal}>
              <span className="material-icons">edit</span>
            </button>
          </div>
        </div>
      }
        <h2 className="text-2xl font-bold mb-4">I Tuoi Eventi</h2>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myEvents.map(event => (
            <EventCard
            key={event.id}
            event={event}
            canJoin={!event.joined_by.includes(parseInt(sessionStorage.getItem('userId')!))}
          />
          ))}
        </section>

        {modal && (
          <div onSubmit={handleSubmit(onSubmit)} className="fixed inset-0 flex items-center bg-gray-900 bg-opacity-50 justify-center z-40">
            <form className="bg-white rounded-lg p-6 px-10 w-1/4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold mb-4">Modifica Profilo</h2>
                <button type="button" onClick={toggleModal} className="-mr-6 -mt-10">
                  <span className="material-icons">close</span>
                </button>
              </div>
              <Controller
                name="birth_date"
                control={control}
                defaultValue={userData.birth_date}
                render={({ field }) => (
                  <div>
                    <label htmlFor="birth_date">Data di Nascita</label>
                    <input 
                      type="date"
                      {...field}
                      className="w-full mb-4 p-2 border border-gray-300 rounded"
                    />
                  </div>
                )}
                
              />
              <Controller
                name="city"
                control={control}
                defaultValue={userData.city}
                render={({ field }) => (
                  <div>
                    <label htmlFor="birth_date">Città di residenza</label> 
                    <input
                      type="text"
                      {...field}
                      className="w-full mb-4 p-2 border border-gray-300 rounded"
                      />
                  </div>
                )}
              />
              <Controller
                name="nation"
                control={control}
                defaultValue={userData.nation}
                render={({ field }) => (
                  <div>
                    <label htmlFor="birth_date">Nazione di residenza</label>
                    <input
                      type="text"
                      {...field}
                      className="w-full mb-4 p-2 border border-gray-300 rounded"
                      />
                  </div>
                )}
              />
              <button
                type="submit" className="primary-button">
                Conferma
              </button>
            </form>
          </div>
        )}
    </main>
  );
}
