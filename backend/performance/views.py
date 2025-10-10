from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Periode, Service, Objectif
from .serializers import PeriodeSerializer, ServiceSerializer, ObjectifSerializer
from rest_framework.permissions import BasePermission
from .permissions import ObjectifAccessPermission

class IsDRH(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "DRH"

class IsResponsable(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "RESPONSABLE_N1"


class PeriodeViewSet(viewsets.ModelViewSet):
    queryset = Periode.objects.all()
    serializer_class = PeriodeSerializer
    permission_classes = [permissions.IsAuthenticated, IsDRH]


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsDRH]


class ObjectifViewSet(viewsets.ModelViewSet):

    serializer_class = ObjectifSerializer
    permission_classes = [permissions.IsAuthenticated, ObjectifAccessPermission]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'DRH':
            return Objectif.objects.all()

        elif user.role == 'RESPONSABLE_N1':
            # Objectifs de ses subordonnés
            return Objectif.objects.filter(agent__responsable_matricule=user.matricule)

        elif user.role == 'AGENT':
            return Objectif.objects.filter(agent=user)

        return Objectif.objects.none()

    def perform_create(self, serializer):
        # Associer automatiquement l’agent connecté
        serializer.save(agent=self.request.user)
# Create your views here.
