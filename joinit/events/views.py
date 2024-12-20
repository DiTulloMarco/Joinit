from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.schemas.openapi import AutoSchema
from rest_framework.exceptions import PermissionDenied

from django.db.models import Q
from users.models import CustomUser
from .models import Event, Rating, Favorite
from .serializers import EventSerializer, RatingSerializer, FavoriteSerializer
from rest_framework.exceptions import ValidationError
from django.utils.timezone import now
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser



class EventViewSet(ModelViewSet):
    serializer_class = EventSerializer
    queryset = Event.objects.order_by('-event_date')
    permission_classes = [AllowAny]
    schema = AutoSchema(tags=['Events'])
    parser_classes = [MultiPartParser, FormParser,JSONParser]

    def update(self, request, *args, **kwargs):

        event = self.get_object()

        if event.created_by != request.user:
            raise PermissionDenied("Solo il creatore dell'evento può modificarlo.")

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):

        event = self.get_object()

        if event.created_by != request.user:
            raise PermissionDenied("Solo il creatore dell'evento può modificarlo.")
        return super().partial_update(request, *args, **kwargs)

    def perform_update(self, serializer):
        participation_deadline = serializer.validated_data.get('participation_deadline', None)
        event_date = serializer.validated_data.get('event_date', None)

        if participation_deadline and event_date and participation_deadline > event_date:
            raise ValidationError("La scadenza per la partecipazione deve essere prima della data dell'evento.")
        if participation_deadline and participation_deadline < now():
            raise ValidationError("La scadenza per la partecipazione deve essere nel futuro.")
        if 'cover_image' in self.request.FILES:
            image = self.request.FILES['cover_image']
            if not image.name.lower().endswith(('.png', '.jpg', '.jpeg')):
                raise ValidationError("Cover image must be a PNG, JPG, or JPEG file.")

        serializer.save()
        
    def perform_create(self, serializer):

        if 'cover_image' in self.request.FILES:
            image = self.request.FILES['cover_image']
            if not image.name.lower().endswith(('.png', '.jpg', '.jpeg')):
                raise ValidationError("Cover image must be a PNG, JPG, or JPEG file.")
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['DELETE'], permission_classes=[IsAuthenticated])
    def remove_cover_image(self, request, pk=None):
        """
        Rimuove l'immagine di copertina dell'evento.
        """
        event = self.get_object()
        if event.cover_image:
            event.cover_image.delete(save=True)
            event.cover_image = None
            event.save()
            return Response({'detail': 'Cover image removed successfully.'}, status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'No cover image to remove.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['GET'])
    def event_types(self, request):
        event_types_choices = [choice[1] for choice in Event.EventType.choices]
        return Response(event_types_choices, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'], permission_classes=[IsAdminUser])
    def view_all_events(self, request):
        events = Event.objects.all() 
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
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
    

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def rate(self, request, pk=None):
        event = self.get_object()
        user = request.user

        if not user.can_comment:
            return Response({'detail': 'You are not allowed to comment or rate events.'}, status=status.HTTP_403_FORBIDDEN)

        if not event.joined_by.filter(id=user.id).exists():
            return Response({'detail': 'You cannot rate an event you did not participate in.'}, status=status.HTTP_403_FORBIDDEN)

        existing_rating = Rating.objects.filter(user=user, event=event).first()
        if existing_rating:
            return Response({'detail': 'You have already rated this event.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = RatingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user, event=event)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['GET'], permission_classes=[AllowAny])
    def ratings(self, request, pk=None):
        event = self.get_object()
        ratings = Rating.objects.filter(event=event)
        serializer = RatingSerializer(ratings, many=True)
        return Response(serializer.data)

    
    @action(detail=True, methods=['PUT'], permission_classes=[IsAuthenticated])
    def update_rating(self, request, pk=None):
        event = self.get_object()
        user = request.user 

        if not user.can_comment:
            return Response({'detail': 'You are not allowed to comment or rate events.'}, status=status.HTTP_403_FORBIDDEN)
    
        existing_rating = Rating.objects.filter(user=user, event=event).first()
        if not existing_rating:
            return Response({'detail': 'You have not rated this event yet.'}, status=status.HTTP_400_BAD_REQUEST)
    
        rating_data = {
            'rating': request.data.get('rating'),
            'review': request.data.get('review', existing_rating.review)
        }

        serializer = RatingSerializer(existing_rating, data=rating_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Rating updated successfully.', 'rating': serializer.data}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['DELETE'], permission_classes=[IsAuthenticated])
    def delete_rating(self, request, pk=None):
        event = self.get_object()
        user = request.user  

        try:
            rating = Rating.objects.filter(user=user, event=event).first()

            if not rating:
                return Response({'detail': 'You have not rated this event.'}, status=status.HTTP_404_NOT_FOUND)

            rating.delete()  
            return Response({'detail': 'Your rating has been deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            return Response({'detail': f'An error occurred: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    
    @action(detail=False, methods=['GET'], url_path='search')
    def search_events(self, request):
        z = request.query_params
        filters = Q(is_private=False, cancelled=False)

        if 'q' in z and z['q'].strip():
            q = z['q'].strip()
            category_mapping = {label.lower(): value for value, label in Event.EventType.choices}
            category_value = category_mapping.get(q.lower())
            tag_list = [tag.strip() for tag in q.split(',')]
            filters &= (
                Q(name__icontains=q) |
                Q(tags__overlap=tag_list) |
                (Q(category=category_value) if category_value is not None else Q())
            )

        if 'place' in request.query_params:
            filters &= Q(place__icontains=request.query_params['place'])
        if 'name' in z and z['name'].strip():
            filters &= Q(name__icontains=z['name'].strip())
        if 'category' in z and z['category'].isdigit():
            filters &= Q(category=int(z['category']))
        if 'max_price' in z and z['max_price'].replace('.', '', 1).isdigit():
            filters &= Q(price__lte=float(z['max_price']))
        if 'max_participants' in z and z['max_participants'].isdigit():
            filters &= Q(max_participants__lte=int(z['max_participants']))
        if 'tags' in z and z['tags'].strip():
            tag_list = [tag.strip() for tag in z['tags'].split(',')]
            filters &= Q(tags__overlap=tag_list)

        events = Event.objects.filter(filters).order_by('-event_date')

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
            participation.delete() 
            return Response({'status': 'Your participation has been cancelled.'}, status=status.HTTP_204_NO_CONTENT)
        except Participation.DoesNotExist:
            return Response({'error': 'You are not participating in this event.'}, status=status.HTTP_400_BAD_REQUEST)
        

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def toggle_favorite(self, request, pk=None):
    
        event = self.get_object()
        user = request.user

        favorite, created = Favorite.objects.get_or_create(user=user, event=event)
        if not created:
            favorite.delete()
            return Response({'detail': 'Event removed from favorites.'}, status=status.HTTP_204_NO_CONTENT)

        return Response({'detail': 'Event added to favorites.'}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated])
    def favorites(self, request):
        favorites = Favorite.objects.filter(user=request.user).select_related("event")
        serializer = EventSerializer([fav.event for fav in favorites], many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['GET'], permission_classes=[IsAuthenticated])
    def is_favorite(self, request, pk=None):
        event = self.get_object()
        user = request.user

        is_favorite = Favorite.objects.filter(user=user, event=event).exists()

        return Response({'isFavorite': is_favorite}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['put'])
    def cancel_event(self, request, pk=None):
        event: Event = self.get_object()

        try:
            user = CustomUser.objects.get(id=request.data['userId'])

            if event.created_by != user:
                return Response(
                    {'error': 'Only the owner of the event can delete the event.'},
                    status=status.HTTP_403_FORBIDDEN,
                )
            elif event.cancelled:
                return Response(
                    {'status': 'This event has already been cancelled.'},
                    status=status.HTTP_204_NO_CONTENT,
                )
            else:
                event.cancelled = True
                # Disabilita la validazione delle date
                event.save(validate_dates=False)
                return Response(
                    {'status': 'This event has been cancelled.'},
                    status=status.HTTP_200_OK,
                )
        except Exception as e:
            return Response(
                {'error': 'Unable to cancel the event.', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
        )