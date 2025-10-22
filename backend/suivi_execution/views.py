from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Realisation
from .serializers import RealisationSerializer

class RealisationViewSet(viewsets.ModelViewSet):
    serializer_class = RealisationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(agent=self.request.user)

    def get_queryset(self):
        user = self.request.user

        # 🔹 Base queryset avec optimisations pour éviter le N+1 Query Problem
        base_queryset = (
            Realisation.objects
            .select_related(
                'agent',                # FK direct vers Agent
                'objectif',             # FK direct vers Objectif
                'objectif__agent',      # Jointure jusqu’à l’agent lié à l’objectif
                'objectif__service',    # Jointure jusqu’au service lié à l’objectif
                'objectif__periode'     # Jointure jusqu’à la période de l’objectif
            )
            .prefetch_related()  # Tu peux ajouter ici un ManyToMany si besoin
        )

        # 🔸 Filtrage selon le rôle de l’utilisateur
        if user.role == 'AGENT':
            return base_queryset.filter(agent=user)
        elif user.role == 'RESPONSABLE_N1':
            return base_queryset.filter(objectif__agent__superieur=user)

        return Realisation.objects.none()

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
