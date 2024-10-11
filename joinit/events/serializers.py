from rest_framework import serializers
from .models import Event, Tag, Participation
from users.serializers import UserSerializer 
from rest_framework.reverse import reverse 

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['name']

class ParticipationSerializer(serializers.ModelSerializer):
    joiners = UserSerializer(source='user', read_only=True)
    event = serializers.SerializerMethodField()
    class Meta:
        model = Participation
        fields = ['joiners', 'event', 'participation_date']
    def get_event(self, obj):
        return {
            "name": obj.event.name,
            "description": obj.event.description
        }

class EventSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True)
    participations = serializers.SerializerMethodField()
    shareable_link = serializers.SerializerMethodField() 

    class Meta:
        model = Event
        fields = '__all__'

    def get_participations(self, obj):
        return ParticipationSerializer(obj.participation_set.all(), many=True).data
    
    def get_shareable_link(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(reverse('events-detail', args=[obj.id]))

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        event = Event.objects.create(**validated_data)
        for tag_data in tags_data:
            tag, created = Tag.objects.get_or_create(name=tag_data['name'])
            event.tags.add(tag)
        return event

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', [])
        instance = super().update(instance, validated_data)

        if tags_data:
            instance.tags.clear()
            for tag_data in tags_data:
                tag, created = Tag.objects.get_or_create(name=tag_data['name'])
                instance.tags.add(tag)
        return instance