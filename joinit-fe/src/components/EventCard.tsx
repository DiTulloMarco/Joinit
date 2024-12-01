import React, { useEffect, useState } from 'react';
import { AppRoutes } from '@/enums/AppRoutes';
import axios from 'axios';
import { MyEvent } from '@/types/MyEvent';
import { useToast } from '@/hooks/use-toast';

const url = process.env.API_URL;

type EventCardProps = {
  event: MyEvent;
  canJoin: boolean;
};

export default function EventCard(props: EventCardProps) {
  const { toast }: any = useToast();
  const [canJoin, setCanJoin] = useState<boolean>(false);
  const [joined, setJoined] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean | null>(null); 

  useEffect(() => {
    setCanJoin(props.canJoin && Date.parse(props.event.event_date) > Date.now());
    setJoined(props.event.joined_by?.includes(parseInt(sessionStorage.getItem('userId')!))); 
    if (props.event && props.event.id) {
      checkIfFavorite();
    }
  }, [props.event]);

  const handleJoin = async () => {
    try {
      await axios.put(`${url}/events/${props.event.id}/join/`, {
        userId: sessionStorage.getItem('userId'),
      });
      setCanJoin(false);
      setJoined(true);
      toast({
        title: 'Partecipato',
        description: 'Sei stato aggiunto ai partecipanti!',
        duration: 5000,
      });
    } catch {
      toast({
        title: 'Errore',
        description: 'Non è stato possibile aggiungerti ai partecipanti!',
        duration: 5000,
      });
    }
  };

  const handleCancelJoin = async () => {
    try {
      await axios.put(`${url}/events/${props.event.id}/cancel_join/`, {
        userId: sessionStorage.getItem('userId'),
      });
      setCanJoin(props.canJoin && Date.parse(props.event.event_date) > Date.now());
      setJoined(false);
      toast({
        title: 'Cancellato',
        description: 'Sei stato rimosso dai partecipanti!',
        duration: 5000,
      });
    } catch{
      toast({
        title: 'Errore',
        description: 'Non è stato possibile rimuoverti dai partecipanti!',
        duration: 5000,
      });
    }
  };

  const handleShareEvent = () => {
    navigator.clipboard.writeText(window.location.origin + AppRoutes.EVENT + props.event.id);
    toast({
      title: 'Copiato!',
      description: 'Link copiato negli appunti',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const checkIfFavorite = async () => {
    try {
      const response = await axios.get(`${url}/events/${props.event.id}/is_favorite/`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const response = await axios.post(
        `${url}/events/${props.event.id}/toggle_favorite/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
          },
        }
      );
  
      setIsFavorite((prevState) => !prevState);
  
      toast({
        title: response.data.detail.includes('removed') ? 'Rimosso dai preferiti' : 'Aggiunto ai preferiti',
        description: `L'evento è stato ${response.data.detail.includes('removed') ? 'rimosso dai' : 'aggiunto ai'} preferiti.`,
        duration: 5000,
      });
    } catch (error) {
    }
  };
  

  return (
    <div className="border rounded-lg flex flex-col space-y-7 place-items-center sm:flex-row p-4 sm:space-y-0 sm:space-x-7 bg-white shadow-md dark:bg-gray-900 dark:border-gray-700">
      <div className="min-w-32 h-32 w-32 bg-gray-200 rounded-md dark:bg-gray-700"></div>
      <div className=''>
        <div className='flex items-center justify-between'>
          <h3 className="text-xl font-bold dark:text-white">{props.event.name}</h3>
          <button onClick={handleShareEvent} className='material-icons text-sm'>share</button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {props.event.description}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {new Date(props.event.event_date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + new Date(props.event.event_date).toLocaleTimeString('it-IT', { hour: 'numeric', minute: '2-digit' })} - {props.event.place}
        </p>
        <div className='flex space-x-10 items-center'>
        { canJoin &&
          <button onClick={handleJoin} className="primary-button mt-2 min-w-28 !w-1/3">
            Partecipa
          </button>
        }

        { joined &&
          <button onClick={handleCancelJoin} className="primary-button mt-2 min-w-28 opacity-60 !w-1/3">
            Annulla partecipazione
          </button>
        }

        { !window.location.pathname.includes(AppRoutes.EVENT + props.event.id) &&
          <a href={AppRoutes.EVENT + props.event.id} className='mt-1 opacity-70 hover:opacity-90'>vedi dettagli →</a>
        }
        </div>
        {isFavorite !== null && 
          <button onClick={toggleFavorite} className="text-yellow-500 mt-3">
            {isFavorite ? '❤️ Rimuovi dai preferiti' : '♡ Aggiungi ai preferiti'}
          </button>
        }
      </div>
    </div>
  );
}
