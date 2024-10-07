from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny  #, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.schemas.openapi import AutoSchema

from rest_framework.pagination import PageNumberPagination

from .models import Event
from .serializers import EventSerializer

class EventViewSet(ModelViewSet):
    serializer_class = EventSerializer
    queryset = Event.objects.all()
    permission_classes = [AllowAny]
    schema = AutoSchema(tags=['Events'])

    # returns all public events
    @action(detail=False, methods=['get'])
    def list_public(self, request):
        try:
            events = Event.objects.filter(is_private=False)
        except:
            raise Exception()
        
        page = self.paginate_queryset(events)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)


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
