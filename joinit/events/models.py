from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
from datetime import timedelta

from users.models import CustomUser
    
class Rating(models.Model):
    event = models.ForeignKey('Event', on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.DecimalField(max_digits=2, decimal_places=1, choices=[(x/2, str(x/2)) for x in range(2, 11)])
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')  

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

    event_date      = models.DateTimeField()
    creation_ts     = models.DateTimeField(auto_now_add=True, null=False)
    last_modified_ts= models.DateTimeField(auto_now=True, null=False)
    participation_deadline = models.DateTimeField(default=None)

    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='events', default=-1)
    max_participants = models.PositiveIntegerField(default=20, blank=True, null=True)

    # User Story 8
    is_private = models.BooleanField(default=False, null=False, blank=True)
    cancelled = models.BooleanField(default=False, null=False, blank=True)

    joined_by = models.ManyToManyField(CustomUser)

    def save(self, *args, **kwargs):
        min_date = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        if self.participation_deadline < min_date:
            raise ValueError('Deadline ' + str(self.participation_deadline) + ' must be in the future or today: ' + str(min_date))
        if self.participation_deadline > self.event_date:
            raise ValueError('Participation deadline must be before event date')
        
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name + ' - ' + self.place + ' - ' + str(self.event_date)
    
    #User stories  17 
class Favorite(models.Model):
    event = models.ForeignKey('Event', on_delete=models.CASCADE, related_name="favorites")
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="favorited_by")
    created_at=models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')

    def __str__(self):
        return f'{self.user} favorited {self.event}'

    
