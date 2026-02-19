from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, TechnicianList
from django.urls import path, include

router = DefaultRouter()
router.register(r"tickets", TicketViewSet, basename="tickets")

# urlpatterns = router.urls

urlpatterns = [
    path('', include(router.urls)),
    path('tickets/techs', TechnicianList.as_view(), name='technician_list'),
]