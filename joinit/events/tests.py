from rest_framework.test import APITestCase
from rest_framework.test import force_authenticate

from rest_framework.reverse import reverse
from rest_framework import status

from django.contrib.auth.models import User
from django.contrib.auth import get_user_model

from datetime import datetime

from .models import Event, Participation, Rating, Tag
from .serializers import EventSerializer
from decimal import Decimal



class EventsTest(APITestCase):

    def setUp(self):
        self.base_url = reverse("events-list") #base url "api/v1/event/"
        
        # all custom actions can be reversed by their "name":
        # reverse("basename"-"custom action")
        # where:
        # "basename" is defined in urls.py in the router
        # "custom action" is the name of the function in views.py
        self.public_list_url = reverse("events-list-public")

        
        # Creating the test user to authenticate
        self.user = User.objects.create_user(
            username='prova',
            first_name='provino',
            last_name='provetto',
            email='provino.provetto@email.it',
            password='minitest'
        )

        self.client.force_authenticate(user=self.user)
        pass

    def test_create_delete(self):
        print("\n\nDEBUG: self.base_url:", self.base_url)
        print("\n\nDEBUG: self.public_list_url:", self.public_list_url)
        
        new_event = Event(
            name = "Evento test",
            description = "Descrizione evento test",
            price = 19.99,
            category = Event.NO_CATEGORY,
            country = "Italia",
            city = "Napoli",
            region = "Campania",
            street_name = "Via del Mare",
            house_number = "1",
            starting_ts = datetime(year=2024, month=8, day=30),
            ending_ts = datetime(year=2024, month=8, day=31),
            is_private = "true"
        )
        
        new_event_serialized = EventSerializer(new_event, many=False).data
        print("\nDEBUG: EVENT SERIALIZATION DATA:\n", new_event_serialized)

        # catching deserialization errors before we move on
        event_serializer = EventSerializer(data=new_event_serialized)
        if(event_serializer.is_valid() == False):
            print("\nDEBUG: EVENT DESERIALIZATION ERRORS WILL OCCUR! :\n", event_serializer.errors)
            self.assertEqual(0, "CHECK EVENT DATA, SERIALIZATION ERRORS WILL OCCUR")


        response = self.client.post(self.base_url, new_event_serialized, format="json")
        print("\nDEBUG: response for POST (event creation):", response.status_code)
        # event creation response validation
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get(self.base_url, format="json")
        print("\nDEBUG: EVENTS received from list:\n", response.data["results"])
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["city"], new_event_serialized["city"])

        response = self.client.generic(method="get", path=self.public_list_url)
        print("\nDEBUG: response for LIST-PUBLIC:\n", response)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.delete(self.base_url + "1/")
        print("\nDEBUG: response for DELETE of the event with id = 1:\n", response)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(self.base_url, format="json")
        print("\nDEBUG: events remaining (there should be none) response:\n", response)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    
    

    def setUp(self):
        self.base_url = reverse("events-list")
        self.search_url = reverse("events-search-events")
        

        self.event = Event.objects.create(
            name="Concerto di Musica",
            description="Concerto jazz in piazza",
            city="Roma",
            country="Italia",
            region="Lazio",
            street_name="Via Roma",
            house_number=10,
            price=10.00,
            is_private=False,
            starting_ts=datetime(year=2024, month=10, day=10, hour=18, minute=30),
            ending_ts=datetime(year=2024, month=10, day=10, hour=22, minute=0),
        )

        self.event = Event.objects.create(
            name="Concerto",
            description="Concerto musica in piazza",
            city="Roma",
            country="Italia",
            region="Lazio",
            street_name="Via Roma",
            house_number=10,
            price=10.00,
            is_private=False,
            starting_ts=datetime(year=2024, month=10, day=10, hour=18, minute=30),
            ending_ts=datetime(year=2024, month=10, day=10, hour=22, minute=0),
        )

    def test_search_events(self):
        # Test per cercare un evento con la parola chiave 'Musica'
        search_query = 'musica'
        print(f"\nCerco eventi con la parola chiave: {search_query}")
        response = self.client.get(f'{self.search_url}?query={search_query}')
        print(f"Eventi trovati: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
        self.assertIn("Concerto di Musica", response.data['results'][0]["name"])

        # Test per una ricerca vuota, restituisce tutti gli eventi 
        print("\nCerco eventi senza query")
        response = self.client.get(self.search_url)
        print(f"Eventi trovati senza query: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

class ParticipationTest(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email='testuser@example.com',
            password='password123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create a test event
        self.event = Event.objects.create(
            name="Test Event",
            description="A test event",
            price=0,
            category=Event.NO_CATEGORY,
            country="Italy",
            city="Rome",
            region="Lazio",
            street_name="Via Roma",
            house_number=100,
            starting_ts=datetime(2024, 10, 15, 18, 0, 0),
            ending_ts=datetime(2024, 10, 15, 22, 0, 0),
        )
        
        self.participate_url = reverse('events-participate', kwargs={'pk': self.event.id})
        self.cancel_url = reverse('events-cancel-participation', kwargs={'pk': self.event.id})

    def test_participation_and_cancellation(self):
        participate_response = self.client.post(self.participate_url)
        print(f"Response on participate: {participate_response.data}")
        self.assertEqual(Participation.objects.count(), 1)

        cancel_response = self.client.delete(self.cancel_url)
        print(f"Response on cancel participation: {cancel_response.data}")
        self.assertEqual(cancel_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Participation.objects.count(), 0)


class RatingReviewTest(APITestCase):

    def setUp(self):
        # Create user
        self.user = get_user_model().objects.create_user(
            email='testuser@example.com', 
            password='password123'
        )
        self.client.force_authenticate(user=self.user)

        # Create event
        self.event = Event.objects.create(
            name="Test Event",
            description="This is a test event.",
            city="Rome",
            country="Italy",
            region="Lazio",
            street_name="Test Street",
            house_number=10,
            price=20.00,
            starting_ts=datetime(2024, 10, 15, 18, 0),
            ending_ts=datetime(2024, 10, 15, 22, 0)
        )

        # Create participation for the event
        Participation.objects.create(user=self.user, event=self.event)

    def test_create_rating(self):
        """Test that a user can successfully create a rating for an event."""
        url = reverse('events-rate-event', kwargs={'pk': self.event.id})
        data = {
            'rating': 4.5,
            'review': 'Great event!'
        }
        print(f"Posting data to {url}: {data}")

        response = self.client.post(url, data, format='json')
        print(f"Response: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, msg=f"Response errors: {response.data}")
        self.assertEqual(Rating.objects.count(), 1)
        self.assertEqual(Rating.objects.first().rating, 4.5)

    def test_duplicate_rating(self):
        """Test that a user cannot rate an event twice."""
        # First rating
        Rating.objects.create(user=self.user, event=self.event, rating=4.0)
        
        # Second attempt to rate the same event
        url = reverse('events-rate-event', kwargs={'pk': self.event.id})
        data = {
            'rating': 3.5,
            'review': 'Changed my mind!'
        }

        print(f"Posting data to {url}: {data}")

        response = self.client.post(url, data, format='json')
        print(f"Response: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)
        self.assertEqual(response.data['detail'], 'You have already rated this event.')

    def test_update_rating(self):
        """Test that a user can update their rating for an event."""
        # Create a rating
        Rating.objects.create(user=self.user, event=self.event, rating=4.0)

        # Update the rating
        url = reverse('events-update-rating', kwargs={'pk': self.event.id})
        data = {
            'rating': 3.5,
            'review': 'Changed my mind, it was okay.'
        }

        print(f"Posting data to {url}: {data}")

        response = self.client.put(url, data, format='json')
        print(f"Response: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK, msg=f"Response errors: {response.data}")

        # Verify that the rating is updated
        updated_rating = Rating.objects.get(event=self.event, user=self.user)
        self.assertEqual(updated_rating.rating, 3.5)
        self.assertEqual(updated_rating.review, 'Changed my mind, it was okay.')