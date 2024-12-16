from users.models import CustomUser 
from rest_framework.test import APITestCase
import time_machine
import datetime
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
# Create your tests here.

class CustomUserTest(APITestCase):
    api_url = '/api/v1/users/'

    sample_user = {
        "first_name": "name",
        "last_name": "surname",
        "email": "user@example.com",
        "birth_date": "2000-12-16",
        "profile_picture": "string",
        "city": "Civitavecchia MArche",
        "nation": "Italia",
        'password': 'samplePsw01!'
    }
    
    def test_register_user(self):
        api_url = f"{self.api_url}auth/register/"
        
        with self.subTest("empty request"):
            response = self.client.post(api_url, {})

            self.assertEqual(response.status_code, 400)

        with self.subTest("without email"):
            sample_user = {                
                'email': '',
                'password': self.sample_user['password']
            }

            response = self.client.post(api_url, sample_user)

            self.assertEqual(response.status_code, 400)
            
        with self.subTest("without password"):
            sample_user = {
                'email': self.sample_user['email'],
                'password': ''
            }

            response = self.client.post(api_url, sample_user)

            self.assertEqual(response.status_code, 400)

        with self.subTest("correct way without name and surname"):
            sample_user = {
                'email': self.sample_user['email'],
                'password': self.sample_user['password']
            }

            response = self.client.post(api_url, sample_user)

            sample_user.pop('password')
            sample_user['id'] = response.data['user']['id']
            sample_user['first_name'] = ''
            sample_user['last_name'] = ''
            
            self.assertEqual(response.status_code, 201)
            self.assertEqual(CustomUser.objects.count(), 1)
            self.assertDictEqual(response.data['user'], sample_user)

        CustomUser.objects.all().delete()

        with self.subTest("correct way with name and surname"):
            sample_user = {                
                'email': self.sample_user['email'],
                'password': self.sample_user['password'],
                'first_name': self.sample_user['first_name'],
                'last_name': self.sample_user['last_name'],
            }

            response = self.client.post(api_url, sample_user)

            sample_user.pop('password')
            sample_user['id'] = response.data['user']['id']
            
            self.assertEqual(response.status_code, 201)
            self.assertEqual(CustomUser.objects.count(), 1)
            self.assertDictEqual(response.data['user'], sample_user)


    @time_machine.travel(datetime.datetime(2024, 12, 16, tzinfo=timezone.get_current_timezone()), tick=False)
    def test_user_login(self):
        api_url = f"{self.api_url}login"

        sample_user = {
            'email': self.sample_user['email'],
            'password': self.sample_user['password']
            }
        user = CustomUser.objects.create_user(email=sample_user['email'], password=sample_user['password'])
        
        with self.subTest("empty request"):
            response = self.client.post(api_url, {})

            self.assertEqual(response.status_code, 400)
        
        with self.subTest("without email"):
            response = self.client.post(api_url, {                
                'email': '',
                'password': sample_user['password']
            })

            self.assertEqual(response.status_code, 400)
            
        with self.subTest("without password"):
            response = self.client.post(api_url, {
                'email': sample_user['email'],
                'password': ''
            })

            self.assertEqual(response.status_code, 400)

        with self.subTest("correct way"):
            response = self.client.post(api_url, sample_user)

            sample_user.pop('password')
            sample_user['id'] = response.data['user']['id']
            
            self.assertEqual(response.status_code, 200)
            self.assertIn('access', response.data)
            self.assertIn('refresh', response.data)
            self.assertDictEqual(response.data['user'], {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'birth_date': user.birth_date,
                'can_join': user.can_join,
                'can_post': user.can_post,
                'can_comment': user.can_comment,
                'profile_picture': None,
                'city': user.city,
                'nation': user.nation,
                'created_at': '2024-12-16T00:00:00+01:00',
                'updated_at': '2024-12-16T00:00:00+01:00',
            })


    @time_machine.travel(datetime.datetime(2024, 12, 16, tzinfo=timezone.get_current_timezone()), tick=False)
    def test_user_refresh(self):
        api_url = f"{self.api_url}token_refresh/"
        user = CustomUser.objects.create_user(email=self.sample_user['email'], password=self.sample_user['password'])
        user_token = RefreshToken.for_user(user)

        response = self.client.post(api_url, {'refresh': str(user_token)})

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertDictEqual(response.data['user'], {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'birth_date': user.birth_date,
            'can_join': user.can_join,
            'can_post': user.can_post,
            'can_comment': user.can_comment,
            'profile_picture': None,
            'city': user.city,
            'nation': user.nation,
            'created_at': '2024-12-16T00:00:00+01:00',
            'updated_at': '2024-12-16T00:00:00+01:00'
        })

    """ 
    def test_signup_with_google(self):
        api_url = f"{self.api_url}auth/signupWithGoogle/"
        response = self.client.post(api_url, self.sample_user)
    """