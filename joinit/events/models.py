from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
from datetime import timedelta

from users.models import CustomUser
    
class Rating(models.Model):
    event = models.ForeignKey('Event', on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.DecimalField(max_digits=2, decimal_places=1, choices=[(x/2, str(x/2)) for x in range(2, 11)])  # 1.0 to 5.0 with 0.5 intervals
    review = models.TextField(blank=True, null=True)  # Optional review text
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')  # Prevent multiple ratings for the same event by the same user

    def __str__(self):
        return f'{self.user} rated {self.event}: {self.rating}'
    

class EventType(models.TextChoices):
    CULTURE = "Culturale"
    MUSIC = "Musica"
    SPORT = "Sportivo"
    ART = "Artistico"
    HISTORY = "Storico"
    EDUCATION = "Educativo"
    HEALTH = "Sanitario"
    ENTERTAINMENT = "Intrattenimento"
    COMMERCE = "Commerciale"
    OTHER = "Altro"

class Event(models.Model):
    name        = models.CharField(max_length=50) 
    description = models.CharField(max_length=1000)
    price       = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    category    = ArrayField(models.CharField(max_length=20, choices=EventType), blank=True, null=True)
    tags        = ArrayField(models.CharField(max_length=30), blank=True, null=True) 
    place       = models.CharField(max_length=200, default="")
    sharable_link = models.URLField(max_length=200, blank=True, null=True)

    creation_ts     = models.DateTimeField(auto_now_add=True, null=False)
    last_modified_ts= models.DateTimeField(auto_now=True, null=False)
    starting_ts     = models.DateTimeField()
    ending_ts       = models.DateTimeField()
    participation_deadline = models.DateTimeField(default=None)

    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='events', default=-1)
    max_participants = models.PositiveIntegerField(default=20, blank=True, null=True)

    # User Story 8
    is_private = models.BooleanField(default=False, null=False, blank=True)
    cancelled = models.BooleanField(default=False, null=False, blank=True)

    joined_by = models.ManyToManyField(CustomUser)

    def save(self, *args, **kwargs):
        today_datetime = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        if self.starting_ts < today_datetime:
            raise ValueError('Starting time must be in the future or today')
        if self.starting_ts > self.ending_ts:
            raise ValueError('Starting time must be before ending time')
        
        if self.participation_deadline < self.ending_ts:
            raise ValueError('Participation deadline must be before ending time')
        
        min_ending_ts = today_datetime + timedelta(days=3)

        if self.ending_ts < min_ending_ts:
            raise ValueError('Ending time must be at least 3 days from today')
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name + ' - ' + self.place + ' - ' + str(self.starting_ts)