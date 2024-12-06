'use client';
import React, { useEffect, useState } from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import Image from 'next/image';
import axios from 'axios';
import { User } from '@/types/User';
import { EditProfileFormType } from '@/types/EditProfileFormType';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

const url = process.env.API_URL;

export default function ProfilePage() {
  const [userData, setUserData] = useState<User>({} as User);
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  const [modal, setModal] = useState<boolean>(false);
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<EditProfileFormType>();

  const toggleModal = () => {
    setModal(!modal);
  };

  async function fetchUser() {
    try {
      const response = await axios.get(`${url}/users/auth/profile/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Failed to fetch user data', error);
    }
  }

  async function fetchEvents() {
    try {
      const response = await axios.get(`${url}/users/auth/user_events/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
      setMyEvents(response.data.results);
    } catch (error) {
      console.error('Failed to fetch user events', error);
    }
  }

  useEffect(() => {
    fetchUser();
    fetchEvents();
  }, []);

  const onSubmit: SubmitHandler<EditProfileFormType> = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const response = await axios.patch(`${url}/users/auth/profile/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });

      console.log('Profile updated:', response.data);
      setUserData({ ...userData, ...response.data });
      toggleModal();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <main className="flex-1 p-8">
      {!userData ? (
        <p>Loading user data...</p>
      ) : (
        <>
          <div className="flex items-center justify-start mb-8">
  <div className="w-40 h-40 rounded-lg overflow-hidden border-4 border-gray-300 shadow-lg mr-6 flex items-center justify-center">
    <Image
      src={userData.profile_picture || "https://via.placeholder.com/150"}
      alt="Profile"
      className="object-cover"
      width={160}
      height={160}
    />
  </div>
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

          <h2 className="text-2xl font-bold mb-4">I Tuoi Eventi</h2>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                canJoin={!event.joined_by.includes(parseInt(sessionStorage.getItem('userId')!, 10))}
              />
            ))}
          </section>

          {modal && (
            <div className="fixed inset-0 flex items-center bg-gray-900 bg-opacity-50 justify-center z-40">
              <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg p-6 px-10 w-1/4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold mb-4">Modifica Profilo</h2>
                  <button type="button" onClick={toggleModal} className="-mr-6 -mt-10">
                    <span className="material-icons">close</span>
                  </button>
                </div>

                <Controller
                  name="birth_date"
                  control={control}
                  defaultValue={userData.birth_date ?? ''}
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
                  defaultValue={userData.city ?? ''}
                  render={({ field }) => (
                    <div>
                      <label htmlFor="city">Città di residenza</label>
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
                  defaultValue={userData.nation ?? ''}
                  render={({ field }) => (
                    <div>
                      <label htmlFor="nation">Nazione di residenza</label>
                      <input
                        type="text"
                        {...field}
                        className="w-full mb-4 p-2 border border-gray-300 rounded"
                      />
                    </div>
                  )}
                />

                <div>
                  <label htmlFor="profile_picture">Foto Profilo</label>
                  <input
                    type="file"
                    id="profile_picture"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setValue('profile_picture', e.target.files[0]);
                      }
                    }}
                    className="w-full mb-4 p-2 border border-gray-300 rounded"
                  />
                </div>

                <button type="submit" className="primary-button">
                  Conferma
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </main>
  );
}
