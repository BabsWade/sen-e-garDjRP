from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Periode, Service, Objectif, Realisation
from .serializers import PeriodeSerializer, ServiceSerializer, ObjectifSerializer, RealisationSerializer
from rest_framework.permissions import BasePermission
from .permissions import ObjectifAccessPermission
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

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

class RealisationViewSet(viewsets.ModelViewSet):

    @action(detail=True, methods=['post'], url_path='valider')
    def valider(self, request, pk=None):
        realisation = self.get_object()
        user = request.user

        if realisation.objectif.agent.superieur != user:
            return Response({'detail': "Non autorisé."}, status=403)

        realisation.est_valide = True
        realisation.est_rejete = False
        realisation.commentaire_rejet = None
        realisation.date_validation = timezone.now()
        realisation.save()
        return Response({'status': 'Réalisation validée'})

    @action(detail=True, methods=['post'], url_path='feedback')
    def donner_feedback(self, request, pk=None):
        realisation = self.get_object()
        user = request.user

        if realisation.objectif.agent.superieur != user:
            return Response({'detail': "Non autorisé."}, status=403)

        feedback = request.data.get('feedback')
        if not feedback:
            return Response({'detail': 'Feedback requis.'}, status=400)

        realisation.feedback = feedback
        realisation.save()
        return Response({'status': 'Feedback enregistré'})

    @action(detail=True, methods=['post'], url_path='rejeter')
    def rejeter(self, request, pk=None):
        realisation = self.get_object()
        user = request.user

        if realisation.objectif.agent.superieur != user:
            return Response({'detail': "Non autorisé."}, status=403)

        commentaire = request.data.get('commentaire')
        if not commentaire:
            return Response({'detail': 'Un commentaire est requis.'}, status=400)

        realisation.est_valide = False
        realisation.est_rejete = True
        realisation.commentaire_rejet = commentaire
        realisation.save()
        return Response({'status': 'Réalisation rejetée'})



class ObjectifViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=['post'], url_path='rejeter', url_name='rejeter_objectif')
    def rejeter_objectif(self, request, pk=None):
        objectif = self.get_object()
        user = request.user

        if user.role != 'RESPONSABLE_N1':
            return Response({'detail': "Permission refusée."}, status=status.HTTP_403_FORBIDDEN)

        if objectif.agent.responsable_matricule != user.matricule:
            return Response({'detail': "Vous n'êtes pas le N+1 de cet agent."}, status=status.HTTP_403_FORBIDDEN)

        commentaire = request.data.get('commentaire_rejet', '').strip()

        if not commentaire:
            return Response({'detail': "Le commentaire de rejet est obligatoire."}, status=status.HTTP_400_BAD_REQUEST)

        objectif.est_rejete = True
        objectif.commentaire_rejet = commentaire
        objectif.est_valide = False  # s'assurer qu’il ne soit pas marqué comme validé
        objectif.date_validation = timezone.now()
        objectif.save()

        return Response({'detail': 'Objectif rejeté avec succès.'}, status=status.HTTP_200_OK)
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

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.est_valide and request.user.role == 'AGENT':
            return Response(
                {'detail': "Objectif validé. Vous ne pouvez plus le modifier."},
                status=status.HTTP_403_FORBIDDEN
            )

        if instance.est_rejete and request.user.role != 'AGENT':
            return Response(
                {'detail': "Objectif déjà rejeté. Il doit être reformulé par l'agent."},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Associer automatiquement l’agent connecté
        serializer.save(agent=self.request.user)
# Create your views here.
