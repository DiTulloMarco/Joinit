import datetime
import time_machine # type: ignore

from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from events.models import Event
from users.models import CustomUser

class TestEventsViewSet(APITestCase):
    api_url = reverse('events-list')
    sample_event ={
            "name": "Evento test",
            "description": "Descrizione evento test",
            "price": 19.99,
            "category": 1,
            "place": "Via del Mare, 1, Napoli, Campania, Italia",
            "is_private": True,
            "event_date": "2025-08-30",
            "participation_deadline": "2025-08-29"
    }
    another_sample_event = {
            "name": "Evento test 2",
            "description": "Descrizione evento test 2",
            "price": 0.00,
            "category": 2,
            "place": "Via del Mare, 12, Roma, Lazio, Italia",
            "event_date": "2025-08-31",
            "participation_deadline": "2025-08-29",
            "is_private": False
    }

    @classmethod
    def setUpTestData(cls):
        cls.user = CustomUser.objects.create(email='joinit@user.it', password='mypassword')

    @time_machine.travel(datetime.datetime(2025, 10, 26, 1, 24, tzinfo=timezone.get_current_timezone()), tick=False)
    def _create_sample_event(self):
        self.sample_event["event_date"] = timezone.now()
        self.sample_event["participation_deadline"] = timezone.now()

        sample_event_data = {**self.sample_event}
        sample_event_data['created_by'] = self.user
        sample_event_data.pop('joined_by', None)
        instance = Event.objects.create(**sample_event_data)
        instance.joined_by.add(self.user)
        return instance
    

    def test_preform_create(self):
        self.client.force_authenticate(self.user)
        self.sample_event["created_by"] = self.user
        with self.subTest("simple create"):
            response = self.client.post(self.api_url, self.sample_event)
            self.assertEqual(response.status_code, 201, response.data)

    def test_update(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(self.api_url, self.sample_event)
        self.assertEqual(response.status_code, 201, response.data)

        with self.subTest("partial update"):
            response = self.client.patch(f"{self.api_url}{response.data['id']}/", {
                "description": "Descrizione evento test modificato",
                "price": 30.54,
                "category": 5
            })        
            self.assertEqual(response.status_code, 200, response.data)

            with self.subTest("full update"):
                response = self.client.put(f"{self.api_url}{response.data['id']}/", {**self.another_sample_event,})
                self.assertEqual(response.status_code, 200, response.data)

    def test_delete(self):
        event = self._create_sample_event()

        response = self.client.delete(f"{self.api_url}{event.id}/")
        self.assertEqual(response.status_code, 204, response.data)

        response = self.client.get(f"{self.api_url}{event.id}/")
        self.assertEqual(response.status_code, 404)

    def test_view_all_events(self):
        with self.subTest("without events"):
            response = self.client.get(self.api_url)
            self.assertEqual(response.status_code, 200, response.data)
            self.assertDictEqual(response.data, {"count": 0, "next": None, "previous": None, "results": []})

        with self.subTest("with events"):
            self._create_sample_event()
            
            response = self.client.get(self.api_url)
            self.assertEqual(response.status_code, 200, response.data)
            
            self.assertEqual(response.data['count'], 1)
            
            event_data = response.data['results'][0]
            self.assertEqual(event_data['name'], self.sample_event['name'])
            self.assertEqual(event_data['description'], self.sample_event['description'])
            self.assertEqual(event_data['price'], str(self.sample_event['price']))  # Decimal fields are returned as strings
            self.assertEqual(event_data['category'], self.sample_event['category'])
            self.assertEqual(event_data['place'], self.sample_event['place'])
            self.assertEqual(event_data['is_private'], self.sample_event['is_private'])