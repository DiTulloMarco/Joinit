from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny  #, IsAuthenticated
from rest_framework.decorators import action
from rest_framework import status


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
        
        serialized_objs = EventSerializer(events, many=True)
        return Response(serialized_objs.data)

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
