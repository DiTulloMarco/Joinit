'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { MyEvent } from '@/types/MyEvent';
import EventCard from '@components/EventCard';
import { AppRoutes } from '@/enums/AppRoutes';
import axios from 'axios';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const url = process.env.API_URL;
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

type EventFormType = {
  name: string;
  description: string;
  price: number;
  category: number;
  tags: string;
  place: string;
  event_date: string;
  participation_deadline: string;
  max_participants: number;
  cover_image?: File | null;
};

export default function EventPage(queryString: any) {
  const router = useRouter();
  const [eventId, setEventId] = useState<number>(-1);
  const [event, setEvent] = useState<MyEvent>({} as MyEvent);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [canJoin, setCanJoin] = useState<boolean>(false);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { control, handleSubmit, formState: { errors } } = useForm<RatingFormType>();
  const [participants, setParticipants] = useState<string[]>([]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const {
    control: ratingControl,
    handleSubmit: handleRatingSubmit,
    formState: { errors: ratingErrors },
  } = useForm<RatingFormType>();

  const {
    control: eventControl,
    handleSubmit: handleEventSubmit,
    setValue,
    formState: { errors: eventErrors },
  } = useForm<EventFormType>();

  const fetchEvent = async () => {
    const response = await axios.get(`${url}/events/${eventId}/`);
    setEvent(response.data);
    setCanJoin(!response.data.joined_by.includes(parseInt(sessionStorage.getItem('userId')!)));
    setIsCreator(response.data.created_by === parseInt(sessionStorage.getItem('userId')!));
    setImagePreview(response.data.cover_image || null);
  };

  const fetchRatings = async () => {
    const response = await axios.get(`${url}/events/${eventId}/ratings/`);
    setRatings(response.data);
  };

  const fetchParticipants = async () => {
    try {
      const responses = await Promise.all(
        event.joined_by.map((userId: number) =>
          axios.get(`${url}/users/${userId}/`).then((res) => res.data)
        )
      );
      setParticipants(responses.map((user) => `${user.first_name} ${user.last_name}`));
    } catch (error) {
      console.error('Error fetching participants:', error);
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
        setDefaultMap();
      }
    } catch {
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

  useEffect(() => {
    if (event.joined_by && event.joined_by.length > 0) {
        fetchParticipants();
    }
  }, [event.joined_by]);


  const checkExistingRating = async () => {
    try {
      const response = await axios.get(`${url}/events/${eventId}/ratings/`);
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
      await axios.delete(`${url}/events/${eventId}/delete_rating/`, {
        data: { rating_id: ratingId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Rating deleted successfully.');
      await fetchRatings();
    } catch (error) {
      console.error('Error checking existing rating:', error);
      return null;
    }
  };
  
  

  const onRatingFormSubmit: SubmitHandler<RatingFormType> = async (data) => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');

    if (!token || !userId) return;

    const payload = { ...data, userId: parseInt(userId) };
    const response = await axios.post(`${url}/events/${eventId}/rate/`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchRatings();
  };

  const onEditFormSubmit: SubmitHandler<EventFormType> = async (data) => {
    try {

      const formData = new FormData();
  
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'tags' && typeof value === 'string') {
          value.split(',').forEach((tag: string) => {
            formData.append('tags', tag.trim());
          });
        } else if (key === 'cover_image' && value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
  
      const response = await axios.patch(`${url}/events/${eventId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
  
      setEvent(response.data);
      console.log('Event updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating event:', error);
    }
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
      <EventCard event={event} canJoin={canJoin} />
      <div ref={mapContainerRef} className="h-64 w-full mb-8 rounded-lg shadow-md relative z-10" />
      <section className="mt-8 space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Descrizione</h3>
          <p className="text-gray-700">{event.description}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Categoria</h3>
          <p className="text-gray-700">
            {[
              "Commerciale",
              "Culturale",
              "Musica",
              "Sportivo",
              "Artistico",
              "Storico",
              "Educativo",
              "Sanitario",
              "Intrattenimento",
              "Altro",
            ][event.category]}
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Deadline Partecipazione</h3>
          <p className="text-gray-700">
            {new Date(event.participation_deadline).toLocaleString()}
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Tags</h3>
          {Array.isArray(event.tags) ? (
            <ul className="flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <li
                  key={index}
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">Nessun tag disponibile</p>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold">Partecipanti</h3>
          <p className="text-gray-700">
            {event.joined_by?.length || 0} / {event.max_participants}
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Prezzo</h3>
          <p className="text-gray-700">{event.price} €</p>
        </div>
      </section>

      <section className="mt-12">
        <h3 className="text-2xl font-bold mb-4">Partecipanti</h3>
        {participants.length > 0 ? (
          <ul className="list-disc pl-6">
            {event.joined_by.map((userId: number, index: number) => (
              <li key={index} className="text-gray-800">
                <a 
                  href={`http://localhost:3000/events/profile/${userId}`} 
                  className="text-blue-500 hover:underline"
                >
                  {participants[index] || `Partecipante ${userId}`}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nessun partecipante al momento.</p>
        )}
      </section>

      <section className="mt-12">
        {Date.parse(event.event_date) < Date.now() ? (
          <>
            <h3 className="text-2xl font-bold mb-4">Commenti</h3>
            <div className="space-y-4">
              <form
                onSubmit={handleRatingSubmit(onRatingFormSubmit)}
                className="flex-col items-center w-1/2 min-w-50 space-y-5"
              >
                <div className="flex items-center">
                  <Controller
                    name="rating"
                    control={ratingControl}
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
                  control={ratingControl}
                  defaultValue=""
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <textarea
                        {...field}
                        placeholder="Inserisci un commento"
                        className="primary-input"
                      />
                      {error && <p className="text-red-600">{error.message}</p>}
                    </>
                  )}
                />
                <button type="submit" className="primary-button !w-1/2 min-w-50">
                  Invia
                </button>
              </form>
              {ratings.length === 0 ? (
                <p className="w-1/2 min-w-50">Nessun commento</p>
              ) : (
                ratings.map((rating) => (
                  <div
                    key={rating.id}
                    className="p-4 border rounded-lg bg-white shadow-md"
                  >
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-800 font-semibold">{rating.user}</p>
                      <div className="text-yellow-500 flex items-center">
                        {[...Array(Math.floor(rating.rating))].map((_, i) => (
                          <span key={i} className="material-icons">
                            star
                          </span>
                        ))}
                        {rating.rating % 1 !== 0 && (
                          <span className="material-icons">star_half</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm ml-4">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-gray-700 mt-2">{rating.review}</p>
                  </div>
                ))
              )}
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
          isCreator ?
          (
            <div className="w-1/2 min-w-50 mt-12">
              <button onClick={handleEventDeletion} className='primary-button hover:border-[#ea3333] hover:border-1 !w-2/5 !text-[#ea3333] !text-sm'>Cancella l'evento<span className='material-icons text-[#ea3333]'>delete</span></button>
            </div>
          ) : (
            <></>
          )
        }
      </section>
      {isCreator && (
        <div className="mt-4">
          <button
            onClick={() => {
              setEditModalOpen(true);
              setValue("name", event.name);
              setValue("description", event.description);
              setValue("price", event.price);
              setValue("category", event.category);
              setValue(
                "tags",
                Array.isArray(event.tags) ? event.tags.join(", ") : event.tags || ""
              );
              setValue("place", event.place);
              setValue("event_date", event.event_date);
              setValue("participation_deadline", event.participation_deadline);
              setValue("max_participants", event.max_participants);
            }}
            className="primary-button"
          >
            Modifica Evento
          </button>
        </div>
      )}
  
      {editModalOpen && (
        <div className="fixed inset-0 flex items-center bg-gray-900 bg-opacity-50 justify-center z-50">
          <form
            onSubmit={handleEventSubmit(onEditFormSubmit)}
            className="bg-white rounded-lg p-6 px-10 w-1/2 space-y-4"
          >
            <h3 className="text-2xl font-bold mb-4">Modifica Evento</h3>
            <Controller
              name="name"
              control={eventControl}
              defaultValue=""
              render={({ field }) => (
                <input {...field} placeholder="Nome Evento" className="primary-input" />
              )}
            />
            <Controller
              name="description"
              control={eventControl}
              defaultValue=""
              render={({ field }) => (
                <textarea {...field} placeholder="Descrizione" className="primary-input" />
              )}
            />
            <Controller
              name="price"
              control={eventControl}
              defaultValue={0}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  placeholder="Prezzo"
                  className="primary-input"
                />
              )}
            />
            <Controller
              name="category"
              control={eventControl}
              defaultValue={0}
              render={({ field }) => (
                <select {...field} className="primary-input">
                  <option value="0">Commerciale</option>
                  <option value="1">Culturale</option>
                  <option value="2">Musica</option>
                  <option value="3">Sportivo</option>
                  <option value="4">Artistico</option>
                  <option value="5">Storico</option>
                  <option value="6">Educativo</option>
                  <option value="7">Sanitario</option>
                  <option value="8">Intrattenimento</option>
                  <option value="9">Altro</option>
                </select>
              )}
            />
            <Controller
              name="tags"
              control={eventControl}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Tag (separati da virgole)"
                  className="primary-input"
                />
              )}
            />
            <Controller
              name="place"
              control={eventControl}
              defaultValue=""
              render={({ field }) => (
                <input {...field} placeholder="Luogo" className="primary-input" />
              )}
            />
            <Controller
              name="event_date"
              control={eventControl}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="datetime-local"
                  placeholder="Data Evento"
                  className="primary-input"
                />
              )}
            />
            <Controller
              name="participation_deadline"
              control={eventControl}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="datetime-local"
                  placeholder="Scadenza Partecipazione"
                  className="primary-input"
                />
              )}
            />
            <Controller
              name="max_participants"
              control={eventControl}
              defaultValue={20}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  placeholder="Numero Massimo Partecipanti"
                  className="primary-input"
                />
              )}
            />
            <div>
              <label htmlFor="cover_image">Immagine di copertina</label>
              <input
                type="file"
                id="cover_image"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setValue("cover_image", e.target.files[0]);
                    setImagePreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
                className="primary-input"
              />
            </div>
            {imagePreview && (
              <div className="mt-4">
                <p>Anteprima:</p>
                <img
                  src={imagePreview}
                  alt="Anteprima"
                  className="rounded-md shadow-md max-w-full max-h-48"
                />
              </div>
            )}
            <div className="flex justify-between">
              <button type="submit" className="primary-button">
                Salva Modifiche
              </button>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="secondary-button"
              >
                Annulla
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
  
}
