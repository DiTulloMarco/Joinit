from django.urls import path
from rest_framework import routers

from . import views

router = routers.SimpleRouter()
router.register(r'', views.UserViewSet)
router.register(r'auth', views.AuthViewSet, basename="auth")

urlpatterns = [
    path("login", views.CustomTokenObtainPairView.as_view(), name="get_token"),
    path("token_refresh/", views.CustomTokenRefreshView.as_view(), name="refresh_token"),
] + router.urls
