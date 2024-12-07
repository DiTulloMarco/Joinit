from django.conf import settings
from rest_framework import serializers
from .models import Event, Rating
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
    tags = serializers.ListField(
        child=serializers.CharField(max_length=30),
        required=False,
        default=list  
    )
    cover_image = serializers.ImageField(
        required=False,
        allow_null=True,
        use_url=True  
    )

    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ['created_by', 'creation_ts', 'last_modified_ts', 'joined_by']

    def validate_tags(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list of strings.")
        for tag in value:
            if not isinstance(tag, str) or not tag.strip():
                raise serializers.ValidationError(f"Invalid tag: {tag}. Tags must be non-empty strings.")
        return value

    def validate_cover_image(self, value):
        if value and not value.name.lower().endswith(('.png', '.jpg', '.jpeg')):
            raise serializers.ValidationError("Cover image must be a PNG, JPG, or JPEG file.")
        return value
    
    def get_cover_image_url(self, obj):
        if obj.cover_image:
            cover_image_path = self.context['request'].build_absolute_uri(obj.cover_image.url)
            print(f"Immagine trovata per l'evento '{obj.name}': {cover_image_path}")
            return cover_image_path
        print(f"Nessuna immagine trovata per l'evento '{obj.name}'")
        return None