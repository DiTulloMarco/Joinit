from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status

from .models import CustomUser
from .serializers import UserSerializer, UserEditSerializer, CustomTokenObtainPairSerializer

# Create your views here.

class CreateUserView(CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request):
        response = super().create(request)
        user = CustomUser.objects.get(id=response.data['id'])
        token = RefreshToken.for_user(user)
        serialized = UserSerializer(user)

        return Response({'token': {str(token.access_token), str(token)}, 'user': serialized.data})
  

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def search(self, request, *args, **kwargs):
        return Response(
            CustomUser.objects.filter(first_name=request.query_params.get('q'))
        )

    def update(self, request, pk):
            try:
                user = CustomUser.objects.get(id=pk)
            except CustomUser.DoesNotExist:
                return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
            user_serialized = UserEditSerializer(instance=user, data=request.data)
            if user_serialized.is_valid():
                user_serialized.save()
                return Response({"user": CustomUser.objects.get(id=pk)}, status=status.HTTP_200_OK)
            return Response(user_serialized.errors, status=status.HTTP_400_BAD_REQUEST)
    