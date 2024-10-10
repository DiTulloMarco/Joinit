from rest_framework.routers import SimpleRouter
from .views import EventViewSet

router = SimpleRouter()
router.register(r'events', EventViewSet, basename="events")

urlpatterns = router.urls
