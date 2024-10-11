from rest_framework import serializers
from .models import Event, Tag, Participation, Rating
from users.serializers import UserSerializer 
from rest_framework.reverse import reverse 
from decimal import Decimal


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

class RatingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # Display the username or string representation of the user
    rating = serializers.DecimalField(max_digits=2, decimal_places=1)  # Keep it as decimal,please

    class Meta:
        model = Rating
        fields = ['id', 'user', 'rating', 'review', 'created_at']

    def validate_rating(self, value):
        try:
            value = Decimal(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError("Invalid rating value. Must be a decimal.")

        if not (0.0 <= value <= 5.0):
            raise serializers.ValidationError("Rating must be between 0.0 and 5.0.")
        if value % Decimal('0.5') != 0:
            raise serializers.ValidationError("Rating must be in increments of 0.5.")

        return value

class EventSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True)
    participations = serializers.SerializerMethodField()
    shareable_link = serializers.SerializerMethodField() 
    
    ratings = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = '__all__'

    def get_participations(self, obj):
        return ParticipationSerializer(obj.participation_set.all(), many=True).data
    
    def get_shareable_link(self, obj):
        request = self.context.get('request')
        if request is None:
            return None
        return request.build_absolute_uri(reverse('events-detail', args=[obj.id]))
    
    def get_ratings(self, obj):
        return RatingSerializer(obj.rating_set.all(), many=True).data

    def get_average_rating(self, obj):
        ratings = obj.rating_set.all()
        if ratings:
            return round(sum([r.rating for r in ratings]) / len(ratings), 1)
        return None

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