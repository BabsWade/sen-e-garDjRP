from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RealisationViewSet

router = DefaultRouter()
router.register(r'realisations', RealisationViewSet, basename='realisation')  # 👈 Enregistre le ViewSet ici
urlpatterns = [
    path('', include(router.urls)),

]