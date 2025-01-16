from users.models import CustomUser 
from rest_framework.test import APITestCase
import time_machine
import datetime
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from users.token import token_generator

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

    def _user_to_dict(self, user):
        """Convert a CustomUser instance to a dictionary matching the response format."""
        return {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'birth_date': user.birth_date.isoformat() if user.birth_date else None,
            'can_join': user.can_join,
            'can_post': user.can_post,
            'can_comment': user.can_comment,
            'profile_picture': None,
            'city': user.city,
            'nation': user.nation,
            'created_at': datetime.datetime(2024, 12, 16, tzinfo=timezone.get_current_timezone()).isoformat(),
            'updated_at': datetime.datetime(2024, 12, 16, tzinfo=timezone.get_current_timezone()).isoformat(),
        }
    
    def test_register_user(self):
        api_url = f"{self.api_url}auth/register/"
        
        with self.subTest("empty request"):
            response = self.client.post(api_url, {})
            self.assertEqual(response.status_code, 400)


        with self.subTest("without email"):
            response = self.client.post(api_url, {
                'email': self.sample_user['email'],
                'password': ''
            })
            self.assertEqual(response.status_code, 400)
            

        with self.subTest("without password"):
            response = self.client.post(api_url, {
                'email': self.sample_user['email'],
                'password': ''
            })
            self.assertEqual(response.status_code, 400)


        with self.subTest("correct way without name and surname"):
            sample_user = {
                'email': self.sample_user['email'],
                'password': self.sample_user['password']
            }

            response = self.client.post(api_url, sample_user)

            sample_user = {
                'email': sample_user['email'],
                'id': response.data['user']['id'],
                'first_name': '',
                'last_name': ''
            }
            
            self.assertEqual(response.status_code, 201)
            self.assertEqual(CustomUser.objects.count(), 1)
            self.assertEqual(response.data['user']['email'], sample_user['email'])
            self.assertEqual(response.data['user']['first_name'], sample_user['first_name'])
            self.assertEqual(response.data['user']['last_name'], sample_user['last_name'])

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
            self.assertEqual(response.data['user']['email'], sample_user['email'])
            self.assertEqual(response.data['user']['first_name'], sample_user['first_name'])
            self.assertEqual(response.data['user']['last_name'], sample_user['last_name'])



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
            self.assertDictEqual(response.data['user'], self._user_to_dict(user))


    @time_machine.travel(datetime.datetime(2024, 12, 16, tzinfo=timezone.get_current_timezone()), tick=False)
    def test_user_refresh(self):
        api_url = f"{self.api_url}token_refresh/"
        user = CustomUser.objects.create_user(email=self.sample_user['email'], password=self.sample_user['password'])
        user_token = RefreshToken.for_user(user)

        response = self.client.post(api_url, {'refresh': str(user_token)})

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertDictEqual(response.data['user'], self._user_to_dict(user))

     
    @time_machine.travel(datetime.datetime(2024, 12, 16, tzinfo=timezone.get_current_timezone()), tick=False)
    def test_signup_with_google(self):
        api_url = f"{self.api_url}auth/signupWithGoogle/"
        sample_user = {}
        response_user = {}
        for x in ['email', 'first_name', 'last_name', 'profile_picture']:
            sample_user[x] = self.sample_user[x]

        with self.subTest("with google correct way"):
            response = self.client.post(api_url, sample_user)
            
            self.assertEqual(CustomUser.objects.count(), 1)

            response_user = self._user_to_dict(CustomUser.objects.first())
            for x in ['birth_date', 'city', 'nation', 'profile_picture', 'can_comment', 'can_join', 'can_post', 'created_at', 'updated_at']:
                response_user.pop(x)
            
            self.assertDictEqual(response.data['user'], response_user)

    
    def test_send_reset_password_email(self):
        api_url = f"{self.api_url}auth/send_reset_password_email/"

        with self.subTest("without user"):
            response = self.client.post(api_url, {'email': self.sample_user['email']})
            self.assertEqual(response.status_code, 400)

        with self.subTest("without user"):
            CustomUser.objects.create_user(
                email=self.sample_user['email'],
                password=self.sample_user['password'],
                first_name=self.sample_user['first_name'],
                last_name=self.sample_user['last_name']
            )
            response = self.client.post(api_url, {'email': self.sample_user['email']})
            self.assertEqual(response.status_code, 200)
    
    def test_set_new_password(self):
        api_url = f"{self.api_url}auth/set_new_password/"

        with self.subTest("without user"):
            response = self.client.put(api_url, {
                'uidb64': '15',
                'token': 'osidbngosbndogibnosd',
                'password': 'NewPassword02!'
            })
            self.assertEqual(response.status_code, 400)

        with self.subTest("with user"):
            user = CustomUser.objects.create_user(
                    email=self.sample_user['email'],
                    password=self.sample_user['password'],
                    first_name=self.sample_user['first_name'],
                    last_name=self.sample_user['last_name']
                )

            response = self.client.put(api_url, {
                'uidb64': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': token_generator.make_token(user),
                'password': 'NewPassword02!'
            })
            self.assertEqual(response.status_code, 200)