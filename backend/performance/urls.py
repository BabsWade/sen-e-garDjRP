from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PeriodeViewSet, ServiceViewSet, ObjectifViewSet

router = DefaultRouter()
router.register(r'periodes', PeriodeViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'objectifs', ObjectifViewSet, basename='objectif')

urlpatterns = [
    path('', include(router.urls)),
]
