from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RealisationViewSet, NotificationViewSet, TauxExecutionAPIView, TauxExecutionCacheAPIView, \
    AgentHistoriqueTauxExecutionAPIView

router = DefaultRouter()
router.register(r'agent-feedbacks', RealisationViewSet, basename='agent-feedbacks')
router.register(r'realisations', RealisationViewSet, basename='realisation')  # 👈 Enregistre le ViewSet ici
router.register(r'notifications', NotificationViewSet, basename='notification')  # 👈 ajouté

urlpatterns = [
    path('', include(router.urls)),
    path('taux-execution/', TauxExecutionAPIView.as_view(), name='taux-execution'),

    path('taux-execution-cache/', TauxExecutionCacheAPIView.as_view(), name='taux-execution-cache'),
    path('agent-historique-taux-execution/', AgentHistoriqueTauxExecutionAPIView.as_view(),
         name='agent-historique-taux-execution'),

]