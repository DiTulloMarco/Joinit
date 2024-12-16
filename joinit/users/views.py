from rest_framework import status
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.schemas.openapi import AutoSchema
from django.db.models import Q
from django.db.transaction import atomic
from django.contrib.auth.hashers import make_password
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_str, force_bytes
from django.contrib.auth.base_user import BaseUserManager
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser



from .models import CustomUser
from . import  serializers
from events.serializers import EventSerializer
from users.token import token_generator

# Create your views here.  

class CustomTokenObtainPairView(TokenObtainPairView):
    schema = AutoSchema(tags=['Users'])
    serializer_class = serializers.CustomTokenObtainPairSerializer

class CustomTokenRefreshView(TokenRefreshView):
    schema = AutoSchema(tags=['Users'])
    serializer_class = serializers.CustomTokenRefreshSerializer

class AuthViewSet(viewsets.ViewSet, viewsets.GenericViewSet):
    serializer_class = serializers.UserEditSerializer
    permission_classes = [IsAuthenticated]
    schema = AutoSchema(tags=['Users'])
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        if self.action == 'send_reset_password_email':
            return serializers.SendPasswordRecoveryInfoSerializer
        if self.action == 'set_new_password':
            return serializers.SetNewPasswordSerializer
        return serializers.UserEditSerializer

    @action(detail=False, methods=['POST'], permission_classes=[AllowAny], serializer_class=serializers.AuthSerializer)
    def register(self, request):
        usr_srlz = serializers.AuthSerializer(data=request.data)
        usr_srlz.is_valid(raise_exception=True)
        user = usr_srlz.save()
        token = RefreshToken.for_user(user)
        return Response({'token': {'access': str(token.access_token), 'refresh': str(token)}, 'user': usr_srlz.data}, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['GET'])
    def profile(self, request):
        serializer = self.get_serializer(instance=request.user)
        return Response(serializer.data)
    
    @atomic()
    @profile.mapping.patch
    def update_profile(self, request):
        user = request.user
        serializer = self.get_serializer(instance=user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        if 'profile_picture' in request.FILES:
            user.profile_picture.delete(save=False)
            user.profile_picture = request.FILES['profile_picture']

        if 'profile_picture' in request.data and not request.data['profile_picture']:
            user.profile_picture.delete(save=False)
            user.profile_picture = None

        serializer.save()
        return Response(serializer.data)
    
    @profile.mapping.delete
    def delete_user(self, request):
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
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
    
    @action(detail=False, methods=['POST'], permission_classes=[AllowAny])
    def send_reset_password_email(self, request):
        user = CustomUser.objects.get(email=request.data['email'])
        current_site = get_current_site(request)
        mail_subject = 'Pinnalo - Reset Password'
        message = render_to_string('reset_password.html', {
            'user': user,
            'domain': current_site.domain,  
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': token_generator.make_token(user),
        })
        try:
            email = EmailMessage(mail_subject, message, to=[user.email])
            email.extra_headers = {'Content-Type': 'text/html'}
            email.send()
        except Exception as e:
            return Response({'Error': 'Email not sent, error: ' + e})

        return Response({'Message': 'Reset password link sent to your email'})

    @action(detail=False, methods=['PUT'], permission_classes=[AllowAny])
    def set_new_password(self, request):
        try:
            uid = force_str(urlsafe_base64_decode(request.data['uidb64']))  
            user = CustomUser.objects.get(id=uid)  
        except(TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):  
            user = None  
            return Response({'Error': 'User not found'})
        if user is not None and token_generator.check_token(user, request.data['token']):  
            user.set_password(request.data['password'])  
            user.save()  
            return Response({'Your password has been set. Now you can login your account.'})  
        else:  
            return Response({'Password reset link is invalid!'})  
    
    @action(detail=False, methods=['GET'], permission_classes=[AllowAny])
    def user_events(self, request):
        user_events = request.user.events.order_by('-event_date')

        page = self.paginate_queryset(user_events)
        if page is not None:
            serializer = EventSerializer(page, many=True, context={'request': request})  
            return self.get_paginated_response(serializer.data)

        serializer = EventSerializer(user_events, many=True, context={'request': request})  
        return Response(serializer.data)
    
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = serializers.UserBaseInfoSerializer
    schema = AutoSchema(tags=['Users'])

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return serializers.UserEditSerializer
        return serializers.UserBaseInfoSerializer

    @action(detail=False, methods=['get'])
    def search(self, request, *args, **kwargs):
        users = CustomUser.objects.filter(
                Q(last_name__icontains=request.query_params.get('q')) | Q(first_name=request.query_params.get('q')))
        users_srlz = serializers.UserBaseInfoSerializer(users, many=True)
        return Response(users_srlz.data)

    @action(detail=True, methods=['get'])
    def get_user_events(self, request, pk):
        try:
            user = CustomUser.objects.get(id=pk)
        except CustomUser.DoesNotExist:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            user_events = user.events.filter(is_private=False).order_by('-event_date')
        except AttributeError:
            return Response({"message": "this user has no events"}, status=status.HTTP_404_NOT_FOUND)
        

        page = self.paginate_queryset(user_events)
        if page is not None:
            serializer = EventSerializer(page, many=True,context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = EventSerializer(user_events, many=True,context={'request': request})
        return Response(serializer.data)
    
class TokenRefreshView(TokenRefreshView):
    schema = AutoSchema(tags=['Users'])