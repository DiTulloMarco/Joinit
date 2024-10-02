from rest_framework.serializers import ModelSerializer
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'password', 'first_name', 'last_name', 'birthDate', 'can_join', 'can_post', 'can_comment', 'profile_picture', 'city', 'nation', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True},
        }
    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user
    
class UserEditSerializer(ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'birthDate', 'can_join', 'can_post', 'can_comment', 'profile_picture', 'city', 'nation']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super(CustomTokenObtainPairSerializer, self).validate(attrs)
        data.update({'user': UserSerializer(self.user).data})
        return data

