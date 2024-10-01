from rest_framework.serializers import ModelSerializer
from .models import Event
from .models import Tag
#from .models import Category

class TagSerializer(ModelSerializer):
    class Meta():
        model = Event
        fields = '__all__'


"""
class CategorySerializer(ModelSerializer):
    class Meta():
        model = Event
        fields = '__all__'
"""
        
class EventSerializer(ModelSerializer):
    class Meta():
        model = Event
        fields = '__all__'
        #fields = [] to choose a specific subset of fields to serialize
        
        