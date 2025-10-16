# evaluation/views.py
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from .models import AutoEvaluation, Evaluation, NoteFinale, Contestation
from .serializers import AutoEvaluationSerializer, EvaluationSerializer, NoteFinaleSerializer, ContestationSerializer
from rest_framework.permissions import IsAuthenticated

class AutoEvaluationViewSet(viewsets.ModelViewSet):
    queryset = AutoEvaluation.objects.all()
    serializer_class = AutoEvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return AutoEvaluation.objects.filter(agent=user)

    def perform_create(self, serializer):
        serializer.save(agent=self.request.user)

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

class NoteFinaleViewSet(viewsets.ModelViewSet):
    queryset = NoteFinale.objects.all()
    serializer_class = NoteFinaleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourne les notes finales pour l'agent connecté."""
        return self.queryset.filter(agent=self.request.user)

class ContestationViewSet(viewsets.ModelViewSet):
    queryset = Contestation.objects.all()
    serializer_class = ContestationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Ne retourner que les contestations de l'agent connecté
        user = self.request.user
        return Contestation.objects.filter(agent=user)

    def perform_create(self, serializer):
        # Lors de la création, force l’agent à être celui connecté
        serializer.save(agent=self.request.user)

