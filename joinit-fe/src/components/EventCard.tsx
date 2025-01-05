import React, { useEffect, useState } from 'react';
import { AppRoutes } from '@/enums/AppRoutes';
import axios from 'axios';
import { MyEvent } from '@/types/MyEvent';
import { useToast } from '@/hooks/use-toast';
import { pdf, Document, Page, Text, View, StyleSheet, Image} from '@react-pdf/renderer';
import logo from '/public/images/LOGO.webp';


const url = process.env.API_URL;
const logoBase64 = 'data:image/webp;base64,AAAAPZYQJDJp+2paNWA4rGvCGLwuTiB72+16VT/WYurKrIGZRp8cCP09QUqgOhT3KXbvc0Q2V6uJW+pCQKjOdWRksh1Zrk=';

type EventCardProps = {
  event: MyEvent;
  canJoin: boolean;
  canInteract: boolean;
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
    };
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
    const userId = sessionStorage.getItem('userId');
    const creatorId = props.event.created_by;
    if (creatorId && userId === creatorId.toString()) {
      toast({
        title: 'Impossibile cancellare',
        description: 'Non puoi rimuovere la tua partecipazione come creatore dell\'evento!',
        duration: 5000,
      });
      return; 
    }
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
    } catch {
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
  

  const handleGetCalendarFile = () => {
    const hiddenLink = document.createElement('a');

    const content =
      'BEGIN:VCALENDAR\r\n' +
      'VERSION:2.0\r\n' +
      'BEGIN:VEVENT\r\n' +
      'DTSTART:' +
      props.event.event_date.toString() +
      '\r\n' +
      'DTEND:' +
      props.event.event_date.toString() +
      '\r\n' +
      'UID:' +
      window.crypto.randomUUID().toString() +
      '@joinit.com\r\n' +
      'DESCRIPTION:' +
      props.event.description.toString() +
      '\r\n' +
      'LOCATION:' +
      props.event.place.toString() +
      '\r\n' +
      'STATUS:TENTATIVE\r\n' +
      'SUMMARY:' +
      props.event.name.toString() +
      '\r\n' +
      'END:VEVENT\r\n' +
      'END:VCALENDAR\r\n';

    const fileICS = new Blob([content], { type: 'text/plain' });
    hiddenLink.href = URL.createObjectURL(fileICS);

    let shortEventName = props.event.name.toString().length > 35 ? props.event.name.toString().substring(0, 35) : props.event.name.toString();
    shortEventName = shortEventName.replace(/ /g, '_');
    hiddenLink.download = 'evento_' + shortEventName + '.ics';

    hiddenLink.click();
    URL.revokeObjectURL(hiddenLink.href);

    toast({
      title: 'Creato!',
      description: 'File iCalendar creato',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const PDFStyle = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: 'Helvetica',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottom: '2px solid #ccc',
      paddingBottom: 10,
      marginBottom: 20,
    },
    logoText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#4F46E5',
    },
    date: {
      fontSize: 14,
      color: '#6B7280',
    },
    
    titleContainer: {
      textAlign: 'center',
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
    },
    subtitle: {
      fontSize: 18,
      color: '#4B5563',
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    description: {
      fontSize: 16,
      lineHeight: 1.5,
      textAlign: 'justify',
    },
    detailsContainer: {
      marginTop: 10,
      padding: 10,
      backgroundColor: '#F9FAFB',
      borderRadius: 8,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#374151',
    },
    value: {
      fontSize: 16,
      color: '#1E40AF',
    },
    divider: {
      marginVertical: 30,
      borderBottom: '2px solid #E5E7EB',
    },
    organiserSection: {
      marginTop: 20,
      padding: 10,
      backgroundColor: '#EFF6FF',
      borderRadius: 8,
    },
    organiserLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1D4ED8',
    },
    organiser: {
      fontSize: 16,
      color: '#1E3A8A',
    },
    privateSection: {
      marginTop: 30,
      padding: 15,
      borderRadius: 5,
      backgroundColor: '#F87171',
    },
    privateText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      width: 60,
      height: 60,
      marginRight: 10,
    },
    
  });
  

    const getUserFullName = async (userId: number) => {
      const response = await axios.get(`${url}/users/${userId}/`);  
      if (response.status != 200){
        return null;
      }
      else{
        const userData = response.data;
        return userData.first_name.toString() + " " + userData.last_name.toString();
      }
    };

    const eventPDF = async (props: EventCardProps) => (
      
      <Document>
          <Page style={PDFStyle.page} size="A4">
            {/* Header con logo e data */}
            <View style={PDFStyle.header}>
              <View style={PDFStyle.logoContainer}>
                <Image src={`http://localhost:3000/images/LOGO.webp`} style={PDFStyle.logo} />

                <Text style={PDFStyle.logoText}>JoinIt Events</Text>
              </View>
              <Text style={PDFStyle.date}>
                {new Date(props.event.event_date).toLocaleDateString('it-IT')}
              </Text>
            </View>

            {/* Titolo Evento */}
            <View style={PDFStyle.titleContainer}>
              <Text style={PDFStyle.title}>{props.event.name}</Text>
              <Text style={PDFStyle.subtitle}>
                {props.event.place}
              </Text>
            </View>
      
            {/* Descrizione Evento */}
            <View style={PDFStyle.section}>
              <Text style={PDFStyle.sectionTitle}> Descrizione</Text>
              <Text style={PDFStyle.description}>{props.event.description}</Text>
            </View>
      
            {/* Dettagli Evento */}
            <View style={PDFStyle.detailsContainer}>
              <View style={PDFStyle.detailRow}>
                <Text style={PDFStyle.label}> Prezzo:</Text>
                <Text style={PDFStyle.value}>
                  {props.event.price == 0 ? 'Gratuito' : `€${props.event.price.toString().replace('.', ',')}`}
                </Text>
              </View>
      
              <View style={PDFStyle.detailRow}>
                <Text style={PDFStyle.label}> Partecipanti massimi:</Text>
                <Text style={PDFStyle.value}>
                  {props.event.max_participants || 'Nessun limite'}
                </Text>
              </View>
      
              <View style={PDFStyle.detailRow}>
                <Text style={PDFStyle.label}> Iscrizione entro:</Text>
                <Text style={PDFStyle.value}>
                  {new Date(props.event.participation_deadline).toLocaleDateString('it-IT')}
                </Text>
              </View>
            </View>
      
            {/* Divider */}
            <View style={PDFStyle.divider} />
      
            {/* Organizzatore */}
            <View style={PDFStyle.organiserSection}>
              <Text style={PDFStyle.organiserLabel}> Organizzatore:</Text>
              <Text style={PDFStyle.organiser}>
                {await getUserFullName(props.event.created_by) || 'Nome non disponibile'}
              </Text>
            </View>
      
            {/* Evento Privato */}
            {props.event.is_private && (
              <View style={PDFStyle.privateSection}>
                <Text style={PDFStyle.privateText}>
                   Questo evento è privato. Solo i partecipanti invitati possono accedere.
                </Text>
              </View>
            )}
          </Page>
      </Document>
    );
    

    const handleExportEventData = async () => {
      const pdfFile = await pdf(await eventPDF(props)).toBlob();

    const hiddenLink = document.createElement("a");
    hiddenLink.href = URL.createObjectURL(pdfFile);
    
    var shortEventName = props.event.name.toString().length > 35 ? props.event.name.toString().substring(0, 35) : props.event.name.toString();
    shortEventName = shortEventName.replace(/ /g,"_");
    hiddenLink.download = shortEventName + ".pdf";
    
    hiddenLink.click();
    URL.revokeObjectURL(hiddenLink.href);

    toast({
      title: 'File creato!',
      description: "I dati dell'evento sono stati salvati",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  }

  return (
    <div className="border rounded-lg flex flex-col space-y-7 place-items-center sm:flex-row p-4 sm:space-y-0 sm:space-x-7 bg-white shadow-md dark:bg-gray-900 dark:border-gray-700">
      <div className="min-w-32 h-32 w-32 bg-gray-200 rounded-md dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {props.event.cover_image ? (
          <img
            src={
              typeof props.event.cover_image === 'string'
                ? props.event.cover_image 
                : URL.createObjectURL(props.event.cover_image) 
            }
            alt={`${props.event.name} Cover`}
            className="object-cover w-full h-full"
          />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Nessuna immagine</p>
        )}
      </div>
  
      <div className="">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold dark:text-white">{props.event.name}</h3>
          <button onClick={handleShareEvent} className="material-icons text-sm">
            share
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {new Date(props.event.event_date).toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }) +
            ' ' +
            new Date(props.event.event_date).toLocaleTimeString('it-IT', {
              hour: 'numeric',
              minute: '2-digit',
            })}{' '}
          - {props.event.place}
        </p>
        <div className='flex space-x-10 items-center'>
        { canJoin && props.canInteract && !joined && Date.parse(props.event.participation_deadline) > Date.now() &&
          <button onClick={handleJoin} className="primary-button mt-2 min-w-28 !w-1/3">
            Partecipa
          </button>
        }
        { joined && props.canInteract && !props.event.cancelled && Date.parse(props.event.participation_deadline) > Date.now() &&
          <button onClick={handleCancelJoin} className="primary-button mt-2 min-w-28 opacity-60 !w-1/3">
            Annulla partecipazione
          </button>
        }

        { window.location.pathname.includes(AppRoutes.EVENT + props.event.id) &&
          <>
            <button onClick={handleGetCalendarFile} className="secondary-button mt-2 min-w-28 opacity-60 !w-1/3 hover:underline">
              Aggiungilo al tuo calendario!
            </button>
            <button onClick={handleExportEventData} className="secondary-button mt-2 min-w-28 opacity-60 !w-1/3 hover:underline">
              Scarica i dati dell'evento
            </button>
          </>
        }

        { !window.location.pathname.includes(AppRoutes.EVENT + props.event.id) && props.canInteract &&
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
