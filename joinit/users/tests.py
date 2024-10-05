from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from .models import CustomUser
from .serializers import CustomUserSerializer
from events.models import Event
from datetime import datetime 

import json
# Create your tests here.

class CustomUserTest(APITestCase):

    def setUp(self):
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
        new_event2 = Event(
            name = "Evento test 2",
            description = "Descrizione evento test 2",
            price = 0.00,
            category = Event.CULTURE,
            country = "Italia",
            city = "Roma",
            region = "Lazio",
            street_name = "Via del Mare",
            house_number = "12",
            starting_ts = datetime(year=2024, month=10, day=15),
            ending_ts = datetime(year=2024, month=10, day=25),
            is_private = "false"
        ) 
        self.user = CustomUser.objects.create_user(
            first_name='test',
            last_name='user',
            email='test@email.it',
            password='testpassword',
        )
        self.user.events.add(new_event, new_event2)
        self.register_url=reverse('register')

        self.client.force_authenticate(user=self.user)


    def test_register_user(self):
        new_user =  CustomUser(first_name='test3', last_name='user3', email='test3@email.it', password='testpassword')
        new_user = CustomUserSerializer(new_user)

        response = self.client.post(self.register_url, new_user.data, format='json')
        
        assert response.status_code == 200
        assert CustomUser.objects.count() == 2

        new_user = CustomUser.objects.get(id=2)
      
        self.assertEqual(new_user.first_name, 'test3')
        self.assertEqual(new_user.last_name, 'user3')
        self.assertEqual(new_user.email, 'test3@email.it')

    def test_user_login(self):
        response = self.client.post(reverse('login'), {'email': 'test@email.it', 'password': 'testpassword'}, format='json')
        assert response.status_code == 200

    def test_user_events(self):
        response = self.client.get(reverse('events-list'))
        assert response.status_code == 200
        assert len(json.loads(response.content)['results']) == 2