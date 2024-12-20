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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<EditProfileFormType>();

  const toggleModal = () => {
    setModal(!modal);
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${url}/users/auth/profile/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Errore durante il fetch del profilo utente:', error);
    }
  };

  const fetchEvents = async (page: number) => {
    try {
      const response = await axios.get(`${url}/users/auth/user_events/`, {
        params: { page },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });

      setMyEvents(response.data.results || []);
      setTotalPages(Math.ceil(response.data.count / 10));
    } catch (error) {
      console.error('Errore durante il fetch degli eventi:', error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchEvents(currentPage);
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
      console.error('Errore durante l\'aggiornamento del profilo:', error);
    }
  };

  return (
    <main className="flex-1 p-8">
      {!userData ? (
        <p>Loading user data...</p>
      ) : (
        <>
          <div className="flex items-center justify-start mb-8">
            <Image
              src={userData.profile_picture ? userData.profile_picture : "https://via.placeholder.com/50"}
              width={160}
              height={160}
              alt="Profile"
              className="w-40 h-40 rounded-lg overflow-hidden border-4 border-gray-300 shadow-lg mr-6 flex items-center justify-center"
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

          <h2 className="text-2xl font-bold mb-4">I Tuoi Eventi</h2>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {myEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                canJoin={!event.joined_by.includes(parseInt(sessionStorage.getItem('userId')!, 10))}
              />
            ))}
          </section>

          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => goToPage(index + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === index + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              &gt;
            </button>
          </div>

          {modal && (
            <div className="fixed inset-0 flex items-center bg-gray-900 bg-opacity-50 justify-center z-40">
              <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
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
                        className="w-full p-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
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
                      <label htmlFor="city">Città di Residenza</label>
                      <input
                        type="text"
                        {...field}
                        className="w-full p-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
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
                      <label htmlFor="nation">Nazione</label>
                      <input
                        type="text"
                        {...field}
                        className="w-full p-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
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
                    className="w-full p-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  />
                </div>
                <button type="submit" className="primary-button text-center bg-green-500 hover:bg-green-600">
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
