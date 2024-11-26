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

type Rating = {
  id: number;
  user: string;
  rating: number;
  review: string;
  created_at: string;
};

export default function EventPage(queryString: any) {
  const [eventId, setEventId] = useState<number>(-1);
  const [event, setEvent] = useState<MyEvent>({} as MyEvent);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [canJoin, setCanJoin] = useState<boolean>(false);
  const { control, handleSubmit, formState: { errors } } = useForm<RatingFormType>();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  
  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${apiUrl}/events/${eventId}/`);
      setEvent(response.data);
      setCanJoin(!response.data.joined_by.includes(parseInt(sessionStorage.getItem('userId')!)));
      console.log('Event data:', response.data);
    } catch (error) {
      console.error('Error loading event:', error);
    }
  };

  
  const fetchRatings = async () => {
    try {
      const response = await axios.get(`${apiUrl}/events/${eventId}/ratings/`);
      setRatings(response.data);
      console.log('Ratings data fetched:', response.data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };
  

  
  const setDefaultMap = () => {
    const defaultCoordinates = { lat: 41.9029083, lng: 12.5145139 }; // Sapienza default location
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
      }).addTo(mapInstanceRef.current).bindPopup('Tutte le strade (sbagliate) portano a Sapienza').openPopup();
    }
  };

  
  const fetchCoordinatesAndRenderMap = async () => {
    if (!event.place || event.place.trim() === '') {
      console.error('Place not specified');
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
        console.warn('No coordinates found for the specified place');
        setDefaultMap();
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      setDefaultMap();
    }
  };

  useEffect(() => {
    setEventId(queryString.params.id);
    if (eventId === -1) return;

    fetchEvent(); 
    fetchRatings(); 
  }, [eventId]);

  useEffect(() => {
    if (event.place) {
      fetchCoordinatesAndRenderMap();
    }
  }, [event.place]);

  const checkExistingRating = async () => {
    try {
      const response = await axios.get(`${apiUrl}/events/${eventId}/ratings/`);
      console.log('Existing ratings:', response.data);
  
      const userId = parseInt(sessionStorage.getItem('userId')!);
  
      const existingRating = response.data.find((rating: any) => rating.userId === userId);
  
      console.log('Existing rating found:', existingRating);
      return existingRating;
    } catch (error) {
      console.error('Error checking existing rating:', error);
      return null;
    }
  };

  const deleteRating = async (ratingId: number) => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      console.error('User not authenticated');
      return;
    }
  
    try {
      await axios.delete(`${apiUrl}/events/${eventId}/delete_rating/`, {
        data: { rating_id: ratingId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Rating deleted successfully.');
      await fetchRatings(); // Aggiorna la lista dei rating
    } catch (error) {
      console.error('Error checking existing rating:', error);
      return null;
    }
  };
  
  

  const onRatingFormSubmit: SubmitHandler<RatingFormType> = async (data) => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');
  
    if (!token || !userId) {
      console.error('User ID or Token not found in session storage.');
      return;
    }
  
    try {
      console.log('User ID:', userId);
  
      console.log('Checking existing rating...');
      const existingRating = await checkExistingRating();
  
      const endpoint = `${apiUrl}/events/${eventId}/${existingRating ? 'update_rating/' : 'rate/'}`;
      const method = existingRating ? 'put' : 'post';
  
      console.log(`Calling ${method.toUpperCase()} on endpoint: ${endpoint}`);
  
      const payload = {
        rating: data.rating,
        review: data.review,
        userId: parseInt(userId), 
      };
  
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      console.log('Payload:', payload);
      console.log('Headers:', headers);
  
      const response = await axios[method](endpoint, payload, { headers });
  
      console.log(`${existingRating ? 'Updated Rating' : 'New Rating'} success:`, response.data);
  
      console.log('Fetching updated ratings...');
      await fetchRatings();
      console.log('Ratings updated.');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
      } else {
        console.error('Unknown error:', error);
      }
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
        <h3 className="text-2xl font-bold mb-4">Map</h3>
        <div
          ref={mapContainerRef}
          style={{ height: '700px', width: '100%' }}
        />
      </section>

      <section className="mt-12">
        {Date.parse(event.event_date) < Date.now() ? (
          <>
            <h3 className="text-2xl font-bold mb-4">Comments</h3>
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
                          <option value="0.5">0.5</option>
                          <option value="1">1</option>
                          <option value="1.5">1.5</option>
                          <option value="2">2</option>
                          <option value="2.5">2.5</option>
                          <option value="3">3</option>
                          <option value="3.5">3.5</option>
                          <option value="4">4</option>
                          <option value="4.5">4.5</option>
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
                      placeholder="Enter a comment"
                      className="primary-input"
                    />
                  )}
                />
                <button type="submit" className="primary-button !w-1/2 min-w-50">
                  Submit
                </button>
              </form>
              {ratings.map(rating => (
                <div key={rating.id} className="p-4 border rounded-lg bg-white shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-800 font-semibold">{rating.user}</p>
                      <div className="text-yellow-500 flex items-center">
                        {[...Array(Math.floor(rating.rating))].map((_, i) => (
                          <span key={i} className="material-icons">star</span>
                        ))}
                        {rating.rating % 1 !== 0 && <span className="material-icons">star_half</span>}
                      </div>
                      <p className="text-gray-500 text-sm ml-4">{new Date(rating.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => deleteRating(rating.id)}
                      className="text-red-500 hover:underline"
                    >
                      Elimina
                    </button>
                  </div>
                  <p className="text-gray-700 mt-2">{rating.review}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="w-1/2 min-w-50">
            <p>The event has not started yet</p>
          </div>
        )}
      </section>
    </main>
  );
}
