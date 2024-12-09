import hashlib
from pathlib import Path
from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

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

class Event(models.Model):

    class EventType(models.IntegerChoices):
        COMMERCE = 0, _("Commerciale")
        CULTURE = 1, _("Culturale")
        MUSIC = 2, _("Musica")
        SPORT = 3, _("Sportivo")
        ART = 4, _("Artistico")
        HISTORY = 5, _("Storico")
        EDUCATION = 6, _("Educativo")
        HEALTH = 7, _("Sanitario")
        ENTERTAINMENT = 8, _("Intrattenimento")
        OTHER = 9, _("Altro")

    name        = models.CharField(max_length=50) 
    description = models.CharField(max_length=1000)
    price       = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    category    = models.PositiveIntegerField(choices=EventType, default=EventType.OTHER, blank=True, null=True)
    tags        = ArrayField(models.CharField(max_length=30), blank=True, default=list) 
    place       = models.CharField(max_length=200, default="")

    event_date      = models.DateTimeField()
    creation_ts     = models.DateTimeField(auto_now_add=True, null=False)
    last_modified_ts= models.DateTimeField(auto_now=True, null=False)
    participation_deadline = models.DateTimeField(default=None)

    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='events')
    max_participants = models.PositiveIntegerField(default=20, blank=True, null=True)

    cover_image = models.ImageField(upload_to='event_covers/',blank=True,null=True)

    

    # User Story 8
    is_private = models.BooleanField(default=False, null=False, blank=True)
    cancelled = models.BooleanField(default=False, null=False, blank=True)

    joined_by = models.ManyToManyField(CustomUser)

    def _calculate_file_hash(self, file):
        """Calcola l'hash MD5 di un file."""
        hasher = hashlib.md5()
        for chunk in file.chunks():
            hasher.update(chunk)
        return hasher.hexdigest()

    def save(self, *args, **kwargs):
        min_date = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        if self.participation_deadline < min_date:
            raise ValueError('Deadline ' + str(self.participation_deadline) + ' must be in the future or today: ' + str(min_date))
        if self.participation_deadline > self.event_date:
            raise ValueError('Participation deadline must be before event date')
        
        if self.pk:
            previous = Event.objects.filter(pk=self.pk).first()
            if self.cover_image and (not previous or self.cover_image != previous.cover_image):
                current_hash = self._calculate_file_hash(self.cover_image)
                
                # Cerca un'immagine con lo stesso hash
                existing_events = Event.objects.filter(cover_image__isnull=False)
                for event in existing_events:
                    if event.pk != self.pk:
                        file_path = Path(event.cover_image.path)
                        if file_path.exists():
                            with open(file_path, 'rb') as f:
                                existing_hash = hashlib.md5(f.read()).hexdigest()
                                if current_hash == existing_hash:
                                    self.cover_image = event.cover_image
                                    break

            # Rimuove l'immagine precedente se aggiornata
            if previous and previous.cover_image and self.cover_image != previous.cover_image:
                previous.cover_image.delete(save=False)
        
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

    
