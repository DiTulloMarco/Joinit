from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import action
from rest_framework.schemas import AutoSchema

from django.db.models import Q

from .models import CustomUser
from .serializers import UserSerializer, UserEditSerializer, CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer
from events.serializers import EventSerializer

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


class CustomTokenRefreshView(TokenRefreshView):
    schema = AutoSchema(tags=['Users'])
    serializer_class = CustomTokenRefreshSerializer

class UserViewSet(ReadOnlyModelViewSet, RetrieveAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

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
        
            user_serialized = UserEditSerializer(instance=user, data=request.data)
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
            user_events = user.events.all()
        except AttributeError:
            return Response({"message": "this user has no events"}, status=status.HTTP_404_NOT_FOUND)
        

        page = self.paginate_queryset(user_events)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = EventSerializer(user_events, many=True)
        return Response(serializer.data)
    