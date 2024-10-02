from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework import routers

from .views import CreateUserView, UserViewSet, CustomTokenObtainPairView

router = routers.SimpleRouter()
router.register(r'', UserViewSet)
router.register

urlpatterns = [
    path("register", CreateUserView.as_view(), name="register"),
    path("login", CustomTokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh", TokenRefreshView.as_view(), name="refresh_token"),
] + router.urls
