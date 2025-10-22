# evaluation/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AutoEvaluationViewSet, EvaluationViewSet, NoteFinaleViewSet, ContestationViewSet

router = DefaultRouter()

router.register(r'auto-evaluations', AutoEvaluationViewSet, basename='auto-evaluation')
router.register(r'evaluations', EvaluationViewSet, basename='evaluation')
router.register(r'note-finales', NoteFinaleViewSet, basename='note-finale')
router.register(r'contestations', ContestationViewSet, basename='contestation')

urlpatterns = [
    path('', include(router.urls)),
]
