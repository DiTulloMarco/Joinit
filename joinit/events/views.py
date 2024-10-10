from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework import status


from django.db.models import Q
from .models import Event, Participation
from .serializers import EventSerializer, ParticipationSerializer

class EventViewSet(ModelViewSet):
    serializer_class = EventSerializer
    queryset = Event.objects.all()
    permission_classes = [AllowAny]

    # returns all public events
    @action(detail=False, methods=['get'])
    def list_public(self, request):
        try:
            events = Event.objects.filter(is_private=False)
        except:
            raise Exception()
        print(f"Request method: {request.method}")
        print(f"Request user: {request.user}")
        print(f"Request data: {request.data}")
        
        serialized_objs = EventSerializer(events, many=True)
        return Response(serialized_objs.data)
    
         # Action to allow users to participate in an event
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def participate(self, request, pk=None):
        event = self.get_object()
        participation, created = Participation.objects.get_or_create(user=request.user, event=event)
        if created:
            return Response({'status': 'You have successfully joined the event.'}, status=status.HTTP_201_CREATED)
        return Response({'status': 'You are already participating in this event.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def participants(self, request, pk=None):
        event = self.get_object()
        participants = Participation.objects.filter(event=event)
        serializer = ParticipationSerializer(participants, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search_events(self, request):
        filters = Q()  # Inizializza il filtro vuoto

        category = request.query_params.get('category', None)
        name = request.query_params.get('name', None)
        description = request.query_params.get('description', None)
        city = request.query_params.get('city', None)
        price_min = request.query_params.get('price_min', None)
        price_max = request.query_params.get('price_max', None)
        tags = request.query_params.getlist('tags', None)

        # Filtra per nome
        if name:
            filters &= Q(name__icontains=name)

        # Filtra per descrizione
        if description:
            filters &= Q(description__icontains=description)
    
        # Filtra per città, se fornito
        if city:
            filters &= Q(city__icontains=city)

        # Filtra per intervallo di prezzo
        if price_min and price_max:
            filters &= Q(price__gte=price_min, price__lte=price_max)
        elif price_min:
            filters &= Q(price__gte=price_min)
        elif price_max:
            filters &= Q(price__lte=price_max)


        # Add the category filter
        if category:
            filters &= Q(category=category)

        if tags:
            filters &= Q(tags__name__in=tags)


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
