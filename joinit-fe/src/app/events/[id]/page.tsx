'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import { AppRoutes } from '@/enums/AppRoutes';
import axios from 'axios';
import { Rating } from '@/types/Rating';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

const url = process.env.API_URL

type RatingFormType = {
  rating: number;
  review: string;
}

export default function EventPage(queryString: any) {
  
  const router = useRouter();
  const [eventId, setEventId] = useState<number>(-1);
  const [event, setEvent] = useState<MyEvent>({} as MyEvent);
  const [canJoin, setCanJoin] = useState<boolean>(false);
  const [numJoined, setNumJoined] = useState<number>(0);
  const { control, handleSubmit, formState: { errors } } = useForm<RatingFormType>()

  const fetchEvent = async () => { 
    const response = await axios.get(`${url}/events/${eventId}/`);
    setEvent(response.data);
    setCanJoin(!response.data.joined_by.includes(parseInt(sessionStorage.getItem('userId')!)));
    console.log(response.data);
  }

  useEffect(() => {
    setEventId(queryString.params.id);
    if(eventId === -1) {
      return;
    }

    fetchEvent();
  }, [eventId]);
  
  const onRatingFormSubmit: SubmitHandler<RatingFormType> = async (data) => {
    try {
        const response = await axios.post(`${url}/events/${eventId}/rate/`, { 
          ...data, 
          userId: parseInt(sessionStorage.getItem('userId')!)
        });
        const { user, access, refresh } = response.data;
        console.log({ user, access, refresh });
        console.log( 'Rating submit success');
    } catch (error) {
        console.error(error);
        console.error( 'Rating submit failed');
    };
  };

  const handleEventDeletion = async () => {
    try {
      const response = await axios.put(`${url}/events/${eventId}/cancel_event/`, {
        userId: parseInt(sessionStorage.getItem('userId')!)
      });

      console.log('Event deletion was successful');
      router.push(AppRoutes.MY_EVENTS);
    } catch (err) {
      console.error('Evet deletion failed: ' + err);
    }
  }

  return (
    <main className="flex-1 p-8">
      <h2 className="text-3xl font-bold mb-4">{event.name}</h2>
      <EventCard
        event={event}
        canJoin={canJoin}
      />

      <section className="mt-12">
        {Date.parse(event.event_date) < Date.now() ?
          (
          <>
            <h3 className="text-2xl font-bold mb-4">Commenti</h3>
            <div className="space-y-4">
              <form onSubmit={handleSubmit(onRatingFormSubmit)} className="flex-col items-center w-1/2 min-w-50 space-y-5">
              <div className="flex items-center">
                <Controller
                  name="rating"
                  control={control}
                  defaultValue={3}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <select {...field} className="primary-input">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                      {error && <p className="text-red-600">{error.message}</p>}
                    </>
                  )}
                />
              </div>
                <Controller
                  name="review"
                  control={control}
                  defaultValue=""
                  render={({ field, fieldState: { error } }) => (
                    <textarea
                    {...field}
                    placeholder="Inserisci un commento"
                    className="primary-input"
                    />
                  )}
                  />
                <button type="submit" className="primary-button !w-1/2 min-w-50">
                  Invia
                </button>
              </form>
              {event.ratings?.length === 0 && <p className="w-1/2 min-w-50">Nessun commento</p>}
              {event.ratings?.map(rating => (
                <div key={rating.id} className="p-4 border rounded-lg bg-white shadow-md">
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-800 font-semibold">{rating.author_name}</p>
                    <div className="text-yellow-500 flex items-center">
                      {[...Array(Math.floor(rating.rating))].map((_, i) => (
                        <span key={i} className="material-icons">star</span>
                      ))}
                      {rating.rating % 1 !== 0 && <span className="material-icons">star_half</span>}
                    </div>
                    <p className="text-gray-500 text-sm ml-4">{rating.date}</p>
                  </div>
                  <p className="text-gray-700 mt-2">{rating.review}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="w-1/2 min-w-50">
            <p>Evento non ancora iniziato</p>
          </div>
        )}

        { event.cancelled == true &&
          <div className="w-1/2 min-w-50 mt-12">
            <p className='text-[#EA6666] text-sm ml-4'>Questo evento è stato cancellato</p>
          </div>
        }

        { event.cancelled == false &&
          event.created_by == parseInt(sessionStorage.getItem('userId')!) ?
          (
            <div className="w-1/2 min-w-50 mt-12">
              <button onClick={handleEventDeletion} className='primary-button hover:border-[#ea3333] hover:border-1 !w-2/5 !text-[#ea3333] !text-sm'>Cancella l'evento<span className='material-icons text-[#ea3333]'>delete</span></button>
            </div>
          ) : (
            <></>
          )
        
        /**
          event.cancelled == false ?
          (
            event.created_by == parseInt(sessionStorage.getItem('userId') ?
            (
              <div className="w-1/2 min-w-50 mt-12">
                <button onClick={handleEventDeletion} className='primary-button hover:border-[#ea3333] hover:border-1 !w-2/5 !text-[#ea3333] !text-sm'>Cancella l'evento<span className='material-icons text-[#ea3333]'>delete</span></button>
              </div>
            ) : (
              <div></div>
            )
          ) : (
          )  
        */
        }
      </section>
    </main>
  );
}
