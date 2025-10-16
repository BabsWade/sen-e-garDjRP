from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PeriodeViewSet, ServiceViewSet, ObjectifViewSet, PerformanceAPIView, IndicateurViewSet

router = DefaultRouter()
router.register(r'periodes', PeriodeViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'objectifs', ObjectifViewSet, basename='objectif')
router.register(r'indicateurs', IndicateurViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('performance/', PerformanceAPIView.as_view(), name='performance'),

]
