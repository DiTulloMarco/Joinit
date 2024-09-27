from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.tokens import PasswordResetTokenGenerator
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, email, password):
        token = super().get_token({'email': email, 'password': password})

        return token
    
account_activation_token = PasswordResetTokenGenerator()