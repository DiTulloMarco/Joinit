from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.schemas.openapi import AutoSchema

from django.db.models import Q
from .models import Event, Rating, EventType
from .serializers import EventSerializer, RatingSerializer




class EventViewSet(ModelViewSet):
    serializer_class = EventSerializer
    queryset = Event.objects.all()
    permission_classes = [AllowAny]
    schema = AutoSchema(tags=['Events'])

    @action(detail=False, methods=['GET'])
    def get_event_types(self, request):
        event_types_choices = [choice[0] for choice in EventType.choices]
        return Response(event_types_choices, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'], permission_classes=[IsAdminUser])
    def view_all_events(self, request):
        # As an admin, return all events, including private and cancelled ones
        events = Event.objects.all()  # No filter for private or cancelled events
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    # returns all public events
    @action(detail=False, methods=['GET'])
    def list_public(self, request):
        try:
            events = Event.objects.filter(is_private=False, cancelled=False)
        except:
            raise Exception()
        
        page = self.paginate_queryset(events)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)


    # Action to allow users to participate in an event
    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def participate(self, request, pk=None):
        event = self.get_object()
        if not user.can_join:
            return Response({'detail': 'You are not allowed to join events.'}, status=status.HTTP_403_FORBIDDEN)
    
        participation, created = Participation.objects.get_or_create(user=request.user, event=event)
        if created:
            return Response({'status': 'You have successfully joined the event.'}, status=status.HTTP_201_CREATED)
        return Response({'status': 'You are already participating in this event.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['GET'], permission_classes=[AllowAny])
    def participants(self, request, pk=None):
        event = self.get_object()
        participants = Participation.objects.filter(event=event)
        serializer = ParticipationSerializer(participants, many=True)
        return Response(serializer.data)
    

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def rate_event(self, request, pk=None):
        event = self.get_object()
        if not user.can_comment:
            return Response({'detail': 'You are not allowed to comment or rate events.'}, status=status.HTTP_403_FORBIDDEN)


        # Ensure the user has participated in the event
        participation = Participation.objects.filter(user=request.user, event=event).exists()
        if not participation:
            return Response({'detail': 'You cannot rate an event you did not participate in.'}, status=status.HTTP_403_FORBIDDEN)

        # Check if the user has already rated the event
        existing_rating = Rating.objects.filter(user=request.user, event=event).first()
        if existing_rating:
            return Response({'detail': 'You have already rated this event.'}, status=status.HTTP_400_BAD_REQUEST)

        rating_data = {
        'rating': request.data.get('rating'),
        'review': request.data.get('review', '')  # Review is optional
        }

        # Create a new rating
        serializer = RatingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, event=event)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Add a method to list event ratings
    @action(detail=True, methods=['GET'], permission_classes=[AllowAny])
    def ratings(self, request, pk=None):
        event = self.get_object()
        ratings = Rating.objects.filter(event=event)
        serializer = RatingSerializer(ratings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['PUT'], permission_classes=[IsAuthenticated])
    def update_rating(self, request, pk=None):
        event = self.get_object()
        if not user.can_comment:
            return Response({'detail': 'You are not allowed to comment or rate events.'}, status=status.HTTP_403_FORBIDDEN)

    # Ensure the user has already rated the event
        existing_rating = Rating.objects.filter(user=request.user, event=event).first()
        if not existing_rating:
            return Response({'detail': 'You have not rated this event yet.'}, status=status.HTTP_400_BAD_REQUEST)

        # Parse and validate the updated rating and review values
        rating_data = {
            'rating': request.data.get('rating'),
            'review': request.data.get('review', existing_rating.review)  # Default to the previous review if not provided
        }

        # Update the existing rating
        serializer = RatingSerializer(existing_rating, data=rating_data, partial=True)  # Use partial update
        if serializer.is_valid():
            serializer.save()

            # Indicate the rating has been updated
            return Response({'detail': 'Rating updated successfully.', 'rating': serializer.data}, status=status.HTTP_200_OK)
    
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['GET'])
    def search_events(self, request):
        filters = Q(is_private=False, cancelled=False)
        filters &= Q(category="category")

        # Apply the filters to the queryset
        events = Event.objects.filter(filters).order_by('-starting_ts')

        # Paginate the result if necessary
        page = self.paginate_queryset(events)
        if page is not None:
            serialized_objs = self.get_serializer(page, many=True)
            return self.get_paginated_response(serialized_objs.data)

        serialized_objs = self.get_serializer(events, many=True)
        return Response(serialized_objs.data)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def cancel_participation(self, request, pk=None):
        event = self.get_object()
        try:
            participation = Participation.objects.get(user=request.user, event=event)
            participation.delete()  # Remove participation
            return Response({'status': 'Your participation has been cancelled.'}, status=status.HTTP_204_NO_CONTENT)
        except Participation.DoesNotExist:
            return Response({'error': 'You are not participating in this event.'}, status=status.HTTP_400_BAD_REQUEST)
    
    
        

    """
    def list(self, request):
        pass

    def create(self, request):
        pass

    def retrieve(self, request, pk=None):
        # return a particular event (specified by pk)
        pass

    def update(self, request, pk=None):
        pass

    def partial_update(self, request, pk=None):
        pass

    def destroy(self, request, pk=None):
        pass
    """
