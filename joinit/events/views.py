from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny  #, IsAuthenticated
from rest_framework.decorators import action
from rest_framework import status


from django.db.models import Q
from .models import Event
from .serializers import EventSerializer

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
    
    @action(detail=False, methods=['get'])
    def search_events(self, request):
        query = request.query_params.get('query', None)

        if query:
            events = Event.objects.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(city__icontains=query)
            ).order_by('-starting_ts')
        else:
            events = Event.objects.all().order_by('-starting_ts')

    # Utilizza la paginazione
        page = self.paginate_queryset(events)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

   
   
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    

    '''intendi la mia??? di che parli?ummm non so'''

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
