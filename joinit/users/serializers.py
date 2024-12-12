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
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'email', 'birth_date', 'can_join', 'can_post', 'can_comment', 'profile_picture', 'city', 'nation']
        extra_kwargs = {
            'can_join': {'write_only': True},
            'can_post': {'write_only': True},
            'can_comment': {'write_only': True},
            'profile_picture': {'required': False},
        }
    def update(self, instance, validated_data):
        profile_picture = validated_data.pop('profile_picture', None)
        if profile_picture:
            instance.profile_picture = profile_picture
        return super().update(instance, validated_data)

class UserBaseInfoSerializer(ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'birth_date','city','nation', 'profile_picture']

class SendPasswordRecoveryInfoSerializer(ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email']

class SetNewPasswordSerializer(ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['password']

class GoogleUserSerializer(ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name']


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


