# evaluation/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AutoEvaluationViewSet, EvaluationViewSet, NoteFinaleViewSet, ContestationViewSet, \
    ArchiverEvaluationAPIView, HistoriqueEvaluationViewSet, DerniereEvaluationAPIView

router = DefaultRouter()

router.register(r'auto-evaluations', AutoEvaluationViewSet, basename='auto-evaluation')
router.register(r'evaluations', EvaluationViewSet, basename='evaluation')
router.register(r'note-finales', NoteFinaleViewSet, basename='note-finale')
router.register(r'contestations', ContestationViewSet, basename='contestation')
router.register(r'autoevaluations', AutoEvaluationViewSet, basename='autoevaluations')
router.register(r'historique-evaluations', HistoriqueEvaluationViewSet, basename='historique-evaluation')

urlpatterns = [
    path('', include(router.urls)),
    path('archiver-evaluation/<int:periode_id>/', ArchiverEvaluationAPIView.as_view(), name='archiver-evaluation'),
path('derniere-evaluation/', DerniereEvaluationAPIView.as_view(), name='derniere-evaluation')

]