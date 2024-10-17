from django.contrib import admin

from .models import Rating
from .models import Event

admin.site.register(Rating)
admin.site.register(Event)
