from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RealisationViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'agent-feedbacks', RealisationViewSet, basename='agent-feedbacks')
router.register(r'realisations', RealisationViewSet, basename='realisation')  # 👈 Enregistre le ViewSet ici
router.register(r'notifications', NotificationViewSet, basename='notification')  # 👈 ajouté

urlpatterns = [
    path('', include(router.urls)),

]