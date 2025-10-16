from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Periode, Service, Objectif
from .serializers import PeriodeSerializer, ServiceSerializer, ObjectifSerializer
from rest_framework.permissions import BasePermission
from .permissions import ObjectifAccessPermission
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Objectif
from .serializers import ObjectifSerializer
from rest_framework import viewsets
from .permissions import ObjectifAccessPermission
from rest_framework.views import APIView
from .models import Indicateur
from .serializers import IndicateurSerializer

class IsDRH(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "DRH"

class IsResponsable(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "RESPONSABLE_N1"


class PeriodeViewSet(viewsets.ModelViewSet):
    queryset = Periode.objects.all()
    serializer_class = PeriodeSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            # Lecture accessible à tous les utilisateurs connectés (GET, HEAD, OPTIONS)
            return [permissions.IsAuthenticated()]
        # Pour POST, PUT, DELETE → réservé au DRH
        return [permissions.IsAuthenticated(), IsDRH()]



class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsDRH]






class ObjectifViewSet(viewsets.ModelViewSet):
    # Les permissions sont bien définies, on peut ici spécifier l'accès selon le rôle de l'utilisateur.
    permission_classes = [IsAuthenticated, ObjectifAccessPermission]
    serializer_class = ObjectifSerializer

    def get_queryset(self):
        user = self.request.user
        print(f"User connecté : {user}, rôle = {user.role}, ID = {user.id}")

        if user.role == 'DRH':
            return Objectif.objects.all()
        elif user.role == 'RESPONSABLE_N1':
            return Objectif.objects.filter(agent__responsable_matricule=user.matricule)
        elif user.role == 'AGENT':
            return Objectif.objects.filter(agent=user)
        return Objectif.objects.none()

    # Action pour rejeter un objectif
    @action(detail=True, methods=['post'], url_path='rejeter', url_name='rejeter_objectif')
    def rejeter_objectif(self, request, pk=None):
        objectif = self.get_object()
        user = request.user

        # Vérifie si l'utilisateur est un responsable N1
        if user.role != 'RESPONSABLE_N1':
            return Response({'detail': "Permission refusée."}, status=status.HTTP_403_FORBIDDEN)

        # Vérifie que l'utilisateur est bien le N+1 de l'agent associé à l'objectif
        if objectif.agent.responsable_matricule != user.matricule:
            return Response({'detail': "Vous n'êtes pas le N+1 de cet agent."}, status=status.HTTP_403_FORBIDDEN)

        # Vérifie la présence d'un commentaire de rejet
        commentaire = request.data.get('commentaire_rejet', '').strip()
        if not commentaire:
            return Response({'detail': "Le commentaire de rejet est obligatoire."}, status=status.HTTP_400_BAD_REQUEST)

        # Met à jour l'objectif pour le marquer comme rejeté
        objectif.est_rejete = True
        objectif.commentaire_rejet = commentaire
        objectif.est_valide = False  # S'assurer que l'objectif n'est pas validé
        objectif.date_validation = timezone.now()  # Met la date de validation
        objectif.save()  # Sauvegarde l'objectif

        return Response({'detail': 'Objectif rejeté avec succès.'}, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        agent = self.request.user
        service = agent.service  # On suppose que l'agent est lié à un service

        serializer.save(
            agent=agent,
            service=service,
            annee = serializer.validated_data['periode'].date_debut.year
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        # Si l'objectif est validé, un agent ne peut pas le modifier
        if instance.est_valide and request.user.role == 'AGENT':
            return Response(
                {'detail': "Objectif validé. Vous ne pouvez plus le modifier."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Si l'objectif est rejeté, il doit être reformulé par l'agent
        if instance.est_rejete and request.user.role != 'AGENT':
            return Response(
                {'detail': "Objectif déjà rejeté. Il doit être reformulé par l'agent."},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

class PerformanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agent = request.user
        print(f"Agent connecté : {agent} (ID: {agent.id})")

        objectifs = Objectif.objects.filter(agent=agent, est_valide=True)
        print(f"Objectifs trouvés : {objectifs.count()}")

        if not objectifs.exists():
            return Response({"performance_moyenne": 0})

        total_avancement = 0
        for obj in objectifs:
            print(f"Objectif : {obj.libelle}, Avancement : {obj.taux_avancement_total}")
            total_avancement += obj.taux_avancement_total

        moyenne = total_avancement // objectifs.count()
        print(f"Performance moyenne calculée : {moyenne}")

        return Response({"performance_moyenne": moyenne})

class IndicateurViewSet(viewsets.ModelViewSet):
    queryset = Indicateur.objects.all()
    serializer_class = IndicateurSerializer
    permission_classes = [IsAuthenticated]