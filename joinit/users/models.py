import hashlib
from pathlib import Path
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager

class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(_('First Name'), max_length=150, blank=True)
    last_name = models.CharField(_('Last Name'), max_length=150, blank=True)
    birth_date = models.DateField(_('Birth Date'), null=True)
    can_join = models.BooleanField(_('Can Join'), default=True)
    can_post = models.BooleanField(_('Can Post'), default=True)
    can_comment = models.BooleanField(_('Can Comment'), default=True)
    profile_picture = models.ImageField(
        _('Profile Picture'),
        upload_to='profile_pictures/',
        blank=True,
        null=True
    )
    city = models.CharField(_('City'), max_length=100, blank=True, null=True)
    nation = models.CharField(_('Nation'), max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    objects = CustomUserManager()

    def _calculate_file_hash(self, file):
        """Calcola l'hash MD5 di un file."""
        hasher = hashlib.md5()
        for chunk in file.chunks():
            hasher.update(chunk)
        return hasher.hexdigest()

    def save(self, *args, **kwargs):
        if self.pk:
            previous = CustomUser.objects.filter(pk=self.pk).first()   
            if self.profile_picture and self.profile_picture != previous.profile_picture:
                current_hash = self._calculate_file_hash(self.profile_picture)
                existing_users = CustomUser.objects.filter(profile_picture__isnull=False)
                for user in existing_users:
                    if user.pk != self.pk and user.profile_picture and user.profile_picture.path:
                        file_path = Path(user.profile_picture.path)
                        if file_path.exists():
                            with open(file_path, 'rb') as f:
                                existing_hash = hashlib.md5(f.read()).hexdigest()
                                if current_hash == existing_hash:
                                    self.profile_picture = user.profile_picture
                                    break
            if previous and previous.profile_picture and self.profile_picture != previous.profile_picture:
                previous.profile_picture.delete(save=False)

        super().save(*args, **kwargs)
    

    def __str__(self):
        return self.first_name + " " + self.last_name

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
