from django.urls import path
from django.contrib.auth import views as auth_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import routers

from .views import CreateUserView, UserViewSet

router = routers.SimpleRouter()
router.register(r'', UserViewSet)
router.register

urlpatterns = [
    path("register", CreateUserView.as_view(), name="register"),
    path("login", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh", TokenRefreshView.as_view(), name="refresh_token"),
] + router.urls
