from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.schemas.openapi import AutoSchema
from django.db.models import Q

from .models import CustomUser
from .serializers import UserSerializer, UserEditSerializer, CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer
from events.serializers import EventSerializer

# Create your views here.

class CreateUserView(CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    schema = AutoSchema(tags=['Users'])

    def create(self, request):
        response = super().create(request)
        user = CustomUser.objects.get(id=response.data['id'])
        token = RefreshToken.for_user(user)
        serialized = UserSerializer(user)

        return Response({'token': {str(token.access_token), str(token)}, 'user': serialized.data})
  

class CustomTokenObtainPairView(TokenObtainPairView):
    schema = AutoSchema(tags=['Users'])
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenRefreshView(TokenRefreshView):
    schema = AutoSchema(tags=['Users'])
    serializer_class = CustomTokenRefreshSerializer

class UserViewSet(ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    schema = AutoSchema(tags=['Users'])

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserEditSerializer
        return UserSerializer

    @action(detail=False, methods=['get'])
    def search(self, request, *args, **kwargs):
        return Response(
            CustomUser.objects.filter(
                Q(last_name__icontains=request.query_params.get('q')) | Q(first_name=request.query_params.get('q')))
        )

    @action(detail=True, methods=['get'])
    def get_user_events(self, request, pk):
        try:
            user = CustomUser.objects.get(id=pk)
        except CustomUser.DoesNotExist:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            user_events = user.events.all().order_by('-event_date')
        except AttributeError:
            return Response({"message": "this user has no events"}, status=status.HTTP_404_NOT_FOUND)
        

        page = self.paginate_queryset(user_events)
        if page is not None:
            serializer = EventSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = EventSerializer(user_events, many=True)
        return Response(serializer.data)
    
class TokenRefreshView(TokenRefreshView):
    schema = AutoSchema(tags=['Users'])