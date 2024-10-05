from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager


# Create your models here.
class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(_('First Name'), max_length=150, blank=True)
    last_name = models.CharField(_('Last Name'), max_length=150, blank=True)
    birthDate = models.DateField(_('Birth Date'), null=True)
    can_join = models.BooleanField(_('Can Join'), default=True)
    can_post = models.BooleanField(_('Can Post'), default=True)
    can_comment = models.BooleanField(_('Can Comment'), default=True)
    # is_verified = models.BooleanField(_('Verified'),default=False)
    profile_picture = models.CharField(_('Profile Picture'), max_length=100, blank=True, null=True)
    city = models.CharField(_('City'), max_length=100, blank=True, null=True)
    nation = models.CharField(_('Nation'), max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now=True)
    events = models.ManyToManyField('events.Event', blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    objects = CustomUserManager()

    def __str__(self):
        return self.first_name + " " + self.last_name

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'