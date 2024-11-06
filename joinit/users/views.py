from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.schemas.openapi import AutoSchema
from django.db.models import Q
from rest_framework.utils import json
from django.contrib.auth.hashers import make_password
from django.contrib.auth.base_user import BaseUserManager
import requests


from .models import CustomUser
from . import  serializers
from events.serializers import EventSerializer

# Create your views here.  

class CustomTokenObtainPairView(TokenObtainPairView):
    schema = AutoSchema(tags=['Users'])
    serializer_class = serializers.CustomTokenObtainPairSerializer

class CustomTokenRefreshView(TokenRefreshView):
    schema = AutoSchema(tags=['Users'])
    serializer_class = serializers.CustomTokenRefreshSerializer

class UserViewSet(viewsets.ReadOnlyModelViewSet, mixins.UpdateModelMixin, mixins.DestroyModelMixin):
    queryset = CustomUser.objects.all()
    serializer_class = serializers.UserSerializer
    schema = AutoSchema(tags=['Users'])

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return serializers.UserEditSerializer
        return serializers.UserSerializer

    @action(detail=False, methods=['POST'], permission_classes=[AllowAny])
    def register(self, request):
        usr_srlz = self.get_serializer(data=request.data)
        usr_srlz.is_valid(raise_exception=True)
        user = usr_srlz.save()
        token = RefreshToken.for_user(user)
        serialized = self.get_serializer(user)
        return Response({'token': {'access': str(token.access_token), 'refresh': str(token)}, 'user': serialized.data})

    
    @action(detail=False, methods=['POST'], permission_classes=[AllowAny], serializer_class=serializers.GoogleUserSerializer)
    def signupWithGoogle(self, request):
        try:
            user = CustomUser.objects.get(email=request.data['email'])
            token = RefreshToken.for_user(user)
            serialized = self.get_serializer(user)
            return Response({'token': {'access': str(token.access_token), 'refresh': str(token)}, 'user': serialized.data}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            user = CustomUser.objects.create_user(
                email=request.data['email'],
                password=make_password(BaseUserManager().make_random_password()),
                first_name=request.data['first_name'],
                last_name=request.data['last_name'],
            )
        token = RefreshToken.for_user(user)
        serialized = self.get_serializer(user)
        return Response({'token': {'access': str(token.access_token), 'refresh': str(token)}, 'user': serialized.data})

    @action(detail=False, methods=['get'])
    def search(self, request, *args, **kwargs):
        return Response(
            CustomUser.objects.filter(
                Q(last_name__icontains=request.query_params.get('q')) | Q(first_name=request.query_params.get('q')))
        )

    def update(self, request, pk):
            try:
                user = CustomUser.objects.get(id=pk)
            except CustomUser.DoesNotExist:
                return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
            user_serialized = serializers.UserEditSerializer(instance=user, data=request.data)
            if user_serialized.is_valid():
                user_serialized.save()
                return Response({"user": CustomUser.objects.get(id=pk)}, status=status.HTTP_200_OK)
            return Response(user_serialized.errors, status=status.HTTP_400_BAD_REQUEST)

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