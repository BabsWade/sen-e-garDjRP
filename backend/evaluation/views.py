from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import AutoEvaluation, Evaluation, NoteFinale, Contestation
from .serializers import (
    AutoEvaluationSerializer,
    EvaluationSerializer,
    NoteFinaleSerializer,
    ContestationSerializer,
)
from rest_framework.exceptions import ValidationError


class AutoEvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = AutoEvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            AutoEvaluation.objects
            .select_related('agent', 'objectif')
            .filter(agent=user)
        )

    def perform_create(self, serializer):
        user = self.request.user
        objectif = serializer.validated_data.get('objectif')

        # 🧩 Vérifie si l'auto-évaluation existe déjà
        if AutoEvaluation.objects.filter(agent=user, objectif=objectif).exists():
            raise ValidationError("Auto-évaluation déjà soumise pour cet objectif.")

        serializer.save(agent=user)

class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            Evaluation.objects
            .select_related('agent', 'responsable', 'objectif')
            .filter(responsable=user)
        )

    def perform_create(self, serializer):
        user = self.request.user
        agent = serializer.validated_data.get('agent')

        # 🧩 Vérifie que l’agent appartient bien au responsable
        if agent.superieur != user:
            raise ValidationError("Vous ne pouvez évaluer qu’un agent placé sous votre responsabilité.")

        serializer.save(responsable=user)

class NoteFinaleViewSet(viewsets.ModelViewSet):
    serializer_class = NoteFinaleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            NoteFinale.objects
            .select_related('agent')
            .filter(agent=user)
        )


class ContestationViewSet(viewsets.ModelViewSet):
    serializer_class = ContestationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            Contestation.objects
            .select_related('agent', 'evaluation')
            .filter(agent=user)
        )

    def perform_create(self, serializer):
        serializer.save(agent=self.request.user)
