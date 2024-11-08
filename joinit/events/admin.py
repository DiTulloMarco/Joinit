from django.contrib import admin
from django.http import HttpRequest

from .models import Rating
from .models import Event

#admin.site.register(Event)
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'get_created_by_email', 'event_date', 'participation_deadline', 'is_private', 'cancelled')
    list_filter = ('created_by', 'event_date', 'participation_deadline', 'is_private', 'cancelled')
    fieldsets = (
        ('General info', {'fields': ('name', 'description', 'price', 'category', 'tags', 'place', 'created_by', 'max_participants', 'is_private', 'cancelled')}),
        ('Dates', {'fields': ('event_date', 'participation_deadline')}),
        ('Participants', {'fields': ('joined_by',)}),
        #('Rating', {'fields': ('rating',)}),
    )

    def get_created_by_email(self, obj):
        return obj.created_by.email
    
    get_created_by_email.short_description = 'Created By Email'
    get_created_by_email.admin_order_field = 'created_by__email'

    def get_readonly_fields(self, request, obj=None):
        if request.user.is_staff or request.user.is_superuser:
                return [f.name for f in Event._meta.get_fields() if f.name is not 'cancelled']
        else:
            return [f.name for f in Event._meta.get_fields()]
        

admin.site.register(Rating)
