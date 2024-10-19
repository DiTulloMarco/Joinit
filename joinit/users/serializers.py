from rest_framework.serializers import ModelSerializer, StringRelatedField
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import AccessToken
from .models import CustomUser

class UserSerializer(ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'password', 'first_name', 'last_name', 'birth_date', 'can_join', 'can_post', 'can_comment', 'profile_picture', 'city', 'nation', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True},
        }
    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user
    
class UserEditSerializer(ModelSerializer):
    events = StringRelatedField(many=True)
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'birthDate', 'can_join', 'can_post', 'can_comment', 'profile_picture', 'city', 'nation', 'events']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super(CustomTokenObtainPairSerializer, self).validate(attrs)
        data.update({'user': UserSerializer(self.user).data})
        return data

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Estrai il token di accesso aggiornato
        access_token = data.get('access')

        if access_token:
            # Decodifica il token di accesso per ottenere l'ID utente
            access_token_obj = AccessToken(access_token)
            user_id = access_token_obj.get('user_id')

            # Recupera l'utente dal database
            try:
                user = CustomUser.objects.get(id=user_id)
                # Aggiungi i dati dell'utente alla response
                data.update({'user': UserSerializer(user).data})
            except CustomUser.DoesNotExist:
                data.update({'user': None})

        return data


