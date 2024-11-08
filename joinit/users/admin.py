from typing import Any
from django.contrib import admin
from django.http import HttpRequest
from .models import CustomUser

# Register your models here.
#admin.site.register(CustomUser)

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    model = CustomUser
    list_display = ('email', 'first_name', 'last_name', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('first_name', 'last_name', 'email')
    ordering = ('-is_staff',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'birth_date', 'can_join', 'can_post', 'can_comment', 'profile_picture', 'city', 'nation')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser', 'is_active', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('last_login', 'date_joined')})
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'birth_date', 'can_join', 'can_post', 'can_comment', 'profile_picture', 'city', 'nation')}),
     )
    
    def get_readonly_fields(self, request, obj=None):
        if request.user.is_staff and not request.user.is_superuser:
            if obj.is_superuser or obj.is_staff:
                return [f.name for f in CustomUser._meta.get_fields()]
            else:
                return [f.name for f in CustomUser._meta.get_fields() if f.name not in ['can_join', 'can_post', 'can_comment']]
        elif request.user.is_superuser:
            return ['email', 'password', 'first_name', 'last_name', 'birth_date', 'profile_picture', 'city', 'nation',  'is_superuser', 'last_login', 'date_joined'] 
        else:
            return [f.name for f in CustomUser._meta.get_fields()]
        
    def get_fieldsets(self, request, obj):
        if request.user.is_staff and not request.user.is_superuser:
            return [
                (None, {'fields': ('email', )}),
                ('Personal info', {'fields': ('first_name', 'last_name', 'birth_date', 'can_join', 'can_post', 'can_comment', 'profile_picture', 'city', 'nation')}),
                ]
        return super().get_fieldsets(request, obj)