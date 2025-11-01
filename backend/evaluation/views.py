from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import AutoEvaluation, Evaluation, NoteFinale, Contestation, HistoriqueEvaluation
from .serializers import (
    AutoEvaluationSerializer,
    EvaluationSerializer,
    NoteFinaleSerializer,
    ContestationSerializer,
    AutoEvaluationReadSerializer, HistoriqueEvaluationSerializer
)
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from accounts.models import archiver_performance_periode
from rest_framework import generics


class AutoEvaluationViewSet(viewsets.ModelViewSet):
    """
    Vue pour permettre à un agent de faire son auto-évaluation GAR.
    Règles :
      - L’agent ne peut évaluer que ses objectifs validés.
      - Une seule auto-évaluation par objectif.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            AutoEvaluation.objects
            .select_related('agent', 'objectif')
            .filter(agent=user, objectif__statut='valide')
        )

    def get_serializer_class(self):
        # Serializer différent en lecture et écriture
        if self.action in ['list', 'retrieve']:
            return AutoEvaluationReadSerializer
        return AutoEvaluationSerializer

    def perform_create(self, serializer):
        user = self.request.user
        objectif = serializer.validated_data.get('objectif')

        # Double sécurité (déjà dans le serializer, mais aussi ici)
        if objectif.agent != user:
            raise ValidationError("Vous ne pouvez pas auto-évaluer cet objectif.")
        if objectif.statut != 'valide':
            raise ValidationError("Vous ne pouvez auto-évaluer que des objectifs validés.")
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

class ArchiverEvaluationAPIView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, periode_id):
        try:
            message = archiver_performance_periode(periode_id)
            return Response({"detail": message})
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)

class HistoriqueEvaluationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HistoriqueEvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        agent = self.request.user  # si l'user est un Agent
        return HistoriqueEvaluation.objects.filter(agent=agent)

class DerniereEvaluationAPIView(generics.RetrieveAPIView):
    serializer_class = HistoriqueEvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        agent = self.request.user  # agent connecté
        # On récupère la dernière évaluation terminée
        derniere_eval = HistoriqueEvaluation.objects.filter(agent=agent).order_by('-periode__date_fin').first()
        return derniere_eval