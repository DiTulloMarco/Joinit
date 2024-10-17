from rest_framework import serializers
from .models import Event, Rating
from users.serializers import UserSerializer 
from rest_framework.reverse import reverse 
from decimal import Decimal

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

    class Meta:
        model = Event
        fields = '__all__'