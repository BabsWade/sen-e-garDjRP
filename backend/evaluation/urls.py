# evaluation/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AutoEvaluationViewSet, EvaluationViewSet, NoteFinaleViewSet, ContestationViewSet

router = DefaultRouter()
router.register(r'auto-evaluations', AutoEvaluationViewSet)
router.register(r'evaluations', EvaluationViewSet)
router.register(r'note-finales', NoteFinaleViewSet)
router.register(r'contestations', ContestationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]