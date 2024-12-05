from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.schemas.openapi import AutoSchema

from django.db.models import Q
from django.utils import timezone
from users.models import CustomUser
from .models import Event, Rating
from .serializers import EventSerializer, RatingSerializer


class EventViewSet(ModelViewSet):
    serializer_class = EventSerializer
    queryset = Event.objects.order_by('-event_date')
    permission_classes = [AllowAny]
    schema = AutoSchema(tags=['Events'])

    @action(detail=False, methods=['GET'])
    def event_types(self, request):
        event_types_choices = [choice[1] for choice in Event.EventType.choices]
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
            events = Event.objects.filter(is_private=False, cancelled=False).order_by('-event_date')
        except:
            raise Exception()
        
        page = self.paginate_queryset(events)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)


    # Action to allow users to join an event
    @action(detail=True, methods=['PUT'])
    def join(self, request, pk=None):
        event = self.get_object()
        try:
            user = CustomUser.objects.get(id=request.data['userId'])
            if not user.can_join or event.is_private:
                return Response({'detail': 'You are not allowed to join events.'}, status=status.HTTP_403_FORBIDDEN)
            
            if event.participation_deadline < timezone.now():
                return Response({'detail': 'Event participation deadline has passed.'}, status=status.HTTP_400_BAD_REQUEST)

            if event.joined_by.filter(id=user.id).exists():
                return Response({'detail': 'You have already joined this event.'}, status=status.HTTP_400_BAD_REQUEST)

            if event.joined_by.count() >= event.max_participants:
                return Response({'detail': 'Maximum number of participants reached.'}, status=status.HTTP_406_NOT_ACCEPTABLE)


            event.joined_by.add(user)
            event.save()
        except (CustomUser.DoesNotExist, Exception) as e:
            if isinstance(e, CustomUser.DoesNotExist):
                return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)    
            else:
                return Response({'detail': 'Something went wrong: ' + str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'You have successfully joined the event.'}, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['PUT'])
    def cancel_join(self, request, pk=None):
        event = self.get_object()
        try:
            user = CustomUser.objects.get(id=request.data['userId'])
            
            if not event.joined_by.filter(id=user.id).exists():
                return Response({'detail': 'You have not joined this event.'}, status=status.HTTP_400_BAD_REQUEST)
            
            if event.created_by.id == user.id:
                return Response({'detail': 'You cannot cancel your own event.'}, status=status.HTTP_400_BAD_REQUEST)

            event.joined_by.remove(user)
            event.save()
        except (CustomUser.DoesNotExist, Exception) as e:
            if isinstance(e, CustomUser.DoesNotExist):
                return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)    
            else:
                return Response({'detail': 'Something went wrong: ' + str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'You have successfully cancelled your participation in the event.'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['GET'], permission_classes=[AllowAny])
    def participants(self, request, pk=None):
        event = self.get_object()
        participants = Participation.objects.filter(event=event)
        serializer = ParticipationSerializer(participants, many=True)
        return Response(serializer.data)
    

    @action(detail=True, methods=['POST'])
    def rate(self, request, pk=None):
        event = self.get_object()
        try:
            user = CustomUser.objects.get(id=request.data['userId'])
            if not user.can_comment:
                return Response({'detail': 'You are not allowed to comment or rate events.'}, status=status.HTTP_403_FORBIDDEN)

            if not event.joined_by.filter(id=user.id).exists():
                return Response({'detail': 'You cannot rate an event you did not participate in.'}, status=status.HTTP_403_FORBIDDEN)

            # Check if the user has already rated the event
            existing_rating = Rating.objects.filter(user=user, event=event).first()
            if existing_rating:
                return Response({'detail': 'You have already rated this event.'}, status=status.HTTP_400_BAD_REQUEST)
            
            rate_srlz = RatingSerializer(data={'user': request.data['userId'], 'event': event.id, 'rating': request.data['rating'], 'review': request.data['review']})
            if rate_srlz.is_valid():
                rate_srlz.save()
                return Response(rate_srlz.data, status=status.HTTP_201_CREATED)
            return Response(rate_srlz.errors, status=status.HTTP_400_BAD_REQUEST)
        except (CustomUser.DoesNotExist):
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

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
    
    @action(detail=False, methods=['GET'], url_path='search')
    def search_events(self, request):
        q = request.query_params.get('q', '')
        filters = Q(is_private=False, cancelled=False)
        if q:
            filters = (
                       Q(name__icontains=q) | 
                       Q(description__icontains=q) | 
                       Q(place__icontains=q) |
                       Q(tags__overlap=[q]) |
                       Q(category__overlap=[q])
                    )
        # Apply the filters to the queryset
        events = Event.objects.filter(filters).order_by('-event_date')

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
