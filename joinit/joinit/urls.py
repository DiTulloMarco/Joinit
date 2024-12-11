"""
URL configuration for joinit project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework.schemas import get_schema_view
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

base_url = "api/v1/"


from events.views import EventViewSet   # needs to be changed so that event urls are in a separate file (in events/urls.py)
router = routers.SimpleRouter()
router.register(r'api/v1/events', EventViewSet, basename="events")


urlpatterns = [
    path('admin/', admin.site.urls),
    path('schema/', get_schema_view(title="Joinit API"), name="openapi-schema"),
    path('', TemplateView.as_view(template_name="docs.html", extra_context={"schema_url": 'openapi-schema'}), name="swagger-ui"),
    path(base_url + 'users/', include('users.urls')),
    path(base_url, include('events.urls')),
] + router.urls

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)