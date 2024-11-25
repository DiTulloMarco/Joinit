'use client';
import React, { useEffect, useRef, useState } from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import axios from 'axios';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const apiUrl = process.env.API_URL;
const openCageApiKey = '6f6f04412260427eaaf85086d54b3d41';

type RatingFormType = {
  rating: number;
  review: string;
};

export default function EventPage(queryString: any) {
  const [eventId, setEventId] = useState<number>(-1);
  const [event, setEvent] = useState<MyEvent>({} as MyEvent);
  const [canJoin, setCanJoin] = useState<boolean>(false);
  const { control, handleSubmit, formState: { errors } } = useForm<RatingFormType>();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${apiUrl}/events/${eventId}/`);
      setEvent(response.data);
      setCanJoin(!response.data.joined_by.includes(parseInt(sessionStorage.getItem('userId')!)));
      console.log(response.data);
    } catch (error) {
      console.error('Errore durante il caricamento dell\'evento:', error);
    }
  };

  useEffect(() => {
    console.log('Chiave OpenCage:', openCageApiKey);
  }, []);

  useEffect(() => {
    setEventId(queryString.params.id);
    if (eventId === -1) return;

    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const fetchCoordinatesAndRenderMap = async () => {
      if (!event.place || event.place.trim() === '') {
        console.error('Luogo non specificato');
        setDefaultMap();
        return;
      }

      try {
        const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
          params: {
            q: event.place,
            key: openCageApiKey,
            language: 'it',
          },
        });

        const results = response.data.results;
        if (results && results.length > 0) {
          const { lat, lng } = results[0].geometry;

          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
          }

          if (mapContainerRef.current) {
            mapInstanceRef.current = L.map(mapContainerRef.current).setView([lat, lng], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapInstanceRef.current);

            L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              }),
            }).addTo(mapInstanceRef.current).bindPopup(event.place).openPopup();
          }
        } else {
          console.warn('Nessuna coordinata trovata per il luogo specificato');
          setDefaultMap();
        }
      } catch (error) {
        console.error('Errore nella chiamata OpenCage:', error);
        setDefaultMap(); // Usa le coordinate di Roma come fallback in caso di errore
      }
    };

    const setDefaultMap = () => {
      const defaultCoordinates = { lat: 41.9029083, lng: 12.5145139 }; // Coordinate di Sapienza(citta universiatria)

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      if (mapContainerRef.current) {
        mapInstanceRef.current = L.map(mapContainerRef.current).setView([defaultCoordinates.lat, defaultCoordinates.lng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstanceRef.current);

        L.marker([defaultCoordinates.lat, defaultCoordinates.lng], {
          icon: L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
        }).addTo(mapInstanceRef.current).bindPopup('Tutte le strade(sbagliate) portano a Sapienza').openPopup();
      }
    };

    if (event.place) {
      fetchCoordinatesAndRenderMap();
    }
  }, [event.place]);

  const onRatingFormSubmit: SubmitHandler<RatingFormType> = async (data) => {
    try {
      const response = await axios.post(`${apiUrl}/events/${eventId}/rate/`, {
        ...data,
        event_id: eventId,
        userId: parseInt(sessionStorage.getItem('userId')!),
      });
      console.log('Rating submit success', response.data);
    } catch (error) {
      console.error('Rating submit failed', error);
    }
  };

  return (
    <main className="flex-1 p-8">
      <h2 className="text-3xl font-bold mb-4">{event.name}</h2>
      <EventCard
        event={event}
        canJoin={canJoin}
      />

      <section className="mt-12">
        <h3 className="text-2xl font-bold mb-4">Mappa</h3>
        <div
          ref={mapContainerRef}
          style={{ height: '700px', width: '100%' }}
        />
      </section>

      <section className="mt-12">
        {Date.parse(event.event_date) < Date.now() ? (
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
                  render={({ field }) => (
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
      </section>
    </main>
  );
}
