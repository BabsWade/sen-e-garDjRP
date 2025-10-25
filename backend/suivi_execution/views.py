from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .serializers import NotificationSerializer
from rest_framework.decorators import api_view, permission_classes

from .models import Realisation, Notification
from .serializers import RealisationSerializer

class RealisationViewSet(viewsets.ModelViewSet):
    serializer_class = RealisationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(agent=self.request.user)

    def get_queryset(self):
        user = self.request.user

        # Base queryset
        base_queryset = (
            Realisation.objects
            .select_related('agent', 'objectif', 'objectif__agent', 'objectif__service', 'objectif__periode')
            .prefetch_related()
        )

        # 🔹 Appliquer le filtre selon le rôle de l'utilisateur
        if user.role == 'AGENT':
            base_queryset = base_queryset.filter(agent=user)
        elif user.role == 'RESPONSABLE_N1':
            base_queryset = base_queryset.filter(objectif__agent__superieur=user)
        else:
            return Realisation.objects.none()

        # 🔹 Nouveau : filtrer par objectif s'il est passé en paramètre
        objectif_id = self.request.query_params.get('objectif')
        if objectif_id:
            base_queryset = base_queryset.filter(objectif_id=objectif_id)

        return base_queryset

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

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Si l'utilisateur est un agent, renvoyer uniquement ses notifications.
        Sinon, renvoyer tout (par ex. pour un administrateur).
        """
        user = self.request.user
        if hasattr(user, 'agent'):
            return Notification.objects.filter(agent=user.agent).order_by('-date_envoi')
        return Notification.objects.all().order_by('-date_envoi')

    def perform_create(self, serializer):
        """
        Permet de créer une notification pour un agent donné.
        """
        serializer.save()

    @action(detail=True, methods=['post'])
    def marquer_lue(self, request, pk=None):
        """
        Marque une notification comme lue.
        """
        notification = self.get_object()
        if notification.statut != 'Lu':
            notification.statut = 'Lu'
            notification.lue_le = timezone.now()
            notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def agent_notifications(request):
    agent = request.user.agent  # selon ta relation User → Agent
    notifications = Notification.objects.filter(agent=agent).order_by('-created_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)