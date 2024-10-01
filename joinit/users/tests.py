from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from .models import CustomUser
from .serializers import CustomUserSerializer

import json
# Create your tests here.

class CustomUserTest(APITestCase):

    def setUp(self):
        self.user = CustomUser.objects.create_user(
            first_name='test',
            last_name='user',
            email='test@email.it',
            password='testpassword',
        )
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
