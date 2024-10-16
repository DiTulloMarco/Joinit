from django.db import models
from django.conf import settings

class Tag(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=30, unique=False)

    def __str__(self):
        return self.name
    
    
class Rating(models.Model):
    event = models.ForeignKey('Event', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.DecimalField(max_digits=2, decimal_places=1, choices=[(x/2, str(x/2)) for x in range(2, 11)])  # 1.0 to 5.0 with 0.5 intervals
    review = models.TextField(blank=True, null=True)  # Optional review text
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')  # Prevent multiple ratings for the same event by the same user

    def __str__(self):
        return f'{self.user} rated {self.event}: {self.rating}'
    
#class Category(models.Model):
#    name = models.CharField(max_length=30, primary_key=True)

class Event(models.Model):
    name        = models.CharField(max_length=50, blank=False, null=False) # blank=False, null=False
    description = models.CharField(max_length=300) # blank=False, null=False
    # python uses Decimal to represent price (DecimalField)
    price       = models.DecimalField(max_digits=6, decimal_places=2) # blank=False, null=False
    
    # Before
    #category    = models.ForeignKey(Category, on_delete=models.SET_NULL)
    # After
    CULTURE = "CUL"
    MUSIC = "MUS"
    SPORT = "SPR"
    ART = "ART"
    HISTORY = "HIS"
    EDUCATION = "EDU"
    ATTIVISM = "ATT"
    PROTEST = "PRO"
    HEALTH = "HLT"
    ENTERTAINMENT = "ENT"
    COMMERCE = "COM"
    NO_CATEGORY = ""

    CATEGORY_CHOICES = {
        CULTURE: "Culture",
        SPORT: "Sport",
        ART: "Art",
        HISTORY: "History",
        EDUCATION: "Education",
        ATTIVISM: "Attivism",
        PROTEST: "Protest",
        HEALTH: "Health",
        ENTERTAINMENT: "Entertainment",
        COMMERCE: "Commerce",
        MUSIC: "Music",
        NO_CATEGORY: "No category"
    }
    # there can only be one category per event (or no category)
    category = models.CharField(max_length=3, choices=CATEGORY_CHOICES, default=NO_CATEGORY)
    # To get the list of category choices use the automatically created method: get_category_display()
    # This methods returns the human readable form of the choices (the string after : )

    tags     = models.ManyToManyField(Tag, blank=True)
    
    # Address
    country     = models.CharField(max_length=100) # blank=False, null=False
    city        = models.CharField(max_length=40) # blank=False, null=False
    region      = models.CharField(max_length=100) # blank=False, null=False
    street_name = models.CharField(max_length=100) # blank=False, null=False
    house_number= models.PositiveIntegerField() # blank=False, null=False

    creation_ts     = models.DateTimeField(auto_now_add=True, null=False)
    last_modified_ts= models.DateTimeField(auto_now=True, null=False)

    starting_ts     = models.DateTimeField() # blank=False, null=False
    ending_ts       = models.DateTimeField() # blank=False, null=False

    #creator = models.ForeignKey(User) ???

    # null if there are no limits (?)
    max_participants = models.PositiveIntegerField(default=0, null=True) # blank=False

    # should there be a check on creation_ts < partecipation_deadline < ending_ts ?
     # null if no paticipation_deadline is specified
    participation_deadline = models.DateTimeField(default=None, blank=True, null=True)

    # User Story 8
    is_private = models.BooleanField(default=False, null=False, blank=True)

    # We mark the event as cancelled here
    cancelled = models.BooleanField(default=False, null=False, blank=True)


class Participation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event = models.ForeignKey('Event', on_delete=models.CASCADE)
    participation_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')  # Ensure that the same user cannot participate twice

    def __str__(self):
        return f'{self.user} joined {self.event}'
