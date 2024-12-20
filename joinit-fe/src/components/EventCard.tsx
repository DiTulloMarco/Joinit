import React, { useEffect, useState } from 'react';
import { AppRoutes } from '@/enums/AppRoutes';
import axios from 'axios';
import { MyEvent } from '@/types/MyEvent';
import { useToast } from '@/hooks/use-toast';
import { pdf, Document, Page, Text, View, StyleSheet, Image} from '@react-pdf/renderer';

const url = process.env.API_URL;

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

  const handleExportEventData = async () => {

    const PDFStyle = StyleSheet.create({
      page : {
        padding: 20,
      },
      section : {
        marginBottom: "50px",
      },
      sameLine : {
        flexDirection: "row",
        marginBottom: "10px",
      },
      logoImage : {
        width: 70,
        height: "auto",
      },
      logoText : {
        fontSize: "14px",
        fontFamily: "Courier-Oblique",
        letterSpacing: "3px",
        textAlign: "center",
        fontWeight: "bold",
      },
      title : {
        fontSize: "43px",
        fontFamily: "Times-Bold",
        fontWeight: "bold",
        letterSpacing: "2px",
        textAlign: "center",
        marginBottom: "60px"
      },
      stdText : {
        fontSize: "20px",
        fontFamily: "Helvetica",
        letterSpacing: "1px",
        textAlign: "justify",
      },
      description : {
        fontSize: "20px",
        fontFamily: "Helvetica",
        letterSpacing: "1px",
        textAlign: "justify",
      },
      datetime : {
        fontSize: "20px",
        fontFamily: "Helvetica-Bold",
        fontWeight: "bold",
        letterSpacing: "1px",
      },
      price : {
        fontSize: "22px",
        fontFamily: "Helvetica-Bold",
        fontWeight: "bold",
        letterSpacing: "1px",
      },
      header : {
        justifyContent: "center",
        marginTop: "10px",
        marginBottom: "40px",
      },
      organiser : {
        fontSize: "20px",
        fontFamily: "Helvetica-Bold",
        letterSpacing: "2px",
        fontWeight: "bold",
      },
      location : {
        fontSize: "20px",
        fontFamily: "Helvetica-Bold",
        fontWeight: "bold",
        letterSpacing: "1px",
      },
      privateWarning : {
        fontSize: "14px",
        fontFamily: "Courier-Oblique",
        letterSpacing: "3px",
        textAlign: "center",
        fontWeight: "bold",
      },
    });

    const getUserFullName = async (userId: number) => {
      const response = await axios.get(`${url}/users/${userId}/`);
      //console.log("Risposta alla richiesta di dati di un utente conoscendo lo userId: " + response.status);
      
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
          <View style={PDFStyle.header}>
            <Text style={PDFStyle.logoText}>Hosted on JoinIt</Text>
          </View>

          <View style={PDFStyle.section}>
            <Text style={PDFStyle.title}>{props.event.name.toString()}</Text>

            <Text style={PDFStyle.description} break>{props.event.description.toString()}</Text>
          </View>

          <View style={PDFStyle.section}>
            <View style={PDFStyle.sameLine}>
              <Text style={PDFStyle.stdText}>Ingresso: </Text>
              { (props.event.price == 0) ? 
                (
                  <Text style={PDFStyle.price}>gratuito</Text>
                ) : (
                  <Text style={PDFStyle.price}>&#8364;{props.event.price.toString().replace(/\./g, ',')}</Text>
                )
              }
              { (props.event.max_participants == null || props.event.max_participants == 0) ?
                ( 
                  <Text style={PDFStyle.stdText}>&nbsp;, nessun limite al numero di partecipanti</Text>
                ) : (
                  <Text style={PDFStyle.stdText}>&nbsp;, partecipanti massimi: {props.event.max_participants.toString()}</Text>
                )
              }
            </View>
            <View style={PDFStyle.sameLine}>
              <Text style={PDFStyle.stdText}>Data e ora ultime per iscriverti: </Text>
              <Text style={PDFStyle.datetime}>{new Date(props.event.event_date).getDate() + "/" + (new Date(props.event.event_date).getMonth()+1).toString().padStart(2, "0") + "/" + (new Date(props.event.event_date).getFullYear())}</Text>
              <Text style={PDFStyle.stdText}> alle ore </Text>
              <Text style={PDFStyle.datetime}>{new Date(props.event.event_date).getHours().toString().padStart(2, "0") + ":" + new Date(props.event.event_date).getMinutes().toString().padStart(2, "0")}</Text>
            </View>
          </View>

          <View style={PDFStyle.section}>
            <View style={PDFStyle.sameLine}>
              <Text style={PDFStyle.stdText}>Inizio dell'evento: </Text>
              <Text style={PDFStyle.datetime}>{new Date(props.event.event_date).getDate() + "/" + (new Date(props.event.event_date).getMonth()+1).toString().padStart(2, "0") + "/" + (new Date(props.event.event_date).getFullYear())}</Text>
              <Text style={PDFStyle.stdText}> alle ore </Text>
              <Text style={PDFStyle.datetime}>{new Date(props.event.event_date).getHours().toString().padStart(2, "0") + ":" + new Date(props.event.event_date).getMinutes().toString().padStart(2, "0")}</Text>
            </View>


            <View style={PDFStyle.sameLine}>
              <Text style={PDFStyle.stdText}>Indirizzo: </Text>
              <Text style={PDFStyle.location}>{props.event.place.toString()}</Text>
            </View>
          </View>
          
          <View style={PDFStyle.section}>
            <View style={PDFStyle.sameLine}>
              <Text style={PDFStyle.stdText}>Organizzatore: </Text>
              <Text style={PDFStyle.organiser}>
                {await getUserFullName(props.event.created_by) == null ? ("Impossibile ottenere il nome utente") : (await getUserFullName(props.event.created_by))}
              </Text>
            </View>
          </View>

          { props.event.is_private &&
            <View style={PDFStyle.section}>
              <View style={PDFStyle.privateWarning}><b>Questo evento è privato.</b></View>
            </View>
          }
        </Page>

      </Document>
    );

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
        { canJoin && props.canInteract &&
          <button onClick={handleJoin} className="primary-button mt-2 min-w-28 !w-1/3">
            Partecipa
          </button>
        }

        { joined && props.canInteract &&
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
