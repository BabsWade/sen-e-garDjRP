from django.db.models import Q
from rest_framework import viewsets, status, generics, permissions
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

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Realisation.objects
            .select_related('agent', 'objectif', 'objectif__agent', 'objectif__service', 'objectif__periode')
            .prefetch_related()
        )

        # 🟢 Filtrer par objectif si un paramètre est passé dans l’URL
        objectif_id = self.request.query_params.get('objectif')
        if objectif_id:
            queryset = queryset.filter(objectif_id=objectif_id)

        # 🔹 DRH : accès complet
        if user.role == 'DRH':
            return queryset

        # 🔹 Responsable N+1 : réas de ses subordonnés + les siennes
        if user.role == 'RESPONSABLE_N1':
            return queryset.filter(
                Q(agent=user) |
                Q(objectif__agent=user) |
                Q(objectif__agent__responsable=user)
            ).distinct()

        # 🔹 Agent supérieur hiérarchique : réas de ses subordonnés + les siennes
        if user.role == 'AGENT' and getattr(user, 'superieur_hierarchique', False):
            return queryset.filter(
                Q(agent=user) |
                Q(objectif__agent=user) |
                Q(objectif__agent__responsable=user)
            ).distinct()

        # 🔹 Agent simple
        if user.role == 'AGENT':
            return queryset.filter(
                Q(agent=user) | Q(objectif__agent=user)
            ).distinct()

        return Realisation.objects.none()

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

class RealisationCreateAPIView(generics.CreateAPIView):
    """
    POST /api/realisations/ → créer une réalisation
    """
    serializer_class = RealisationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(agent=self.request.user)


class RealisationUpdateDeleteAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    PUT /api/realisations/<id>/ → modifier
    DELETE /api/realisations/<id>/ → supprimer
    """
    queryset = Realisation.objects.all()
    serializer_class = RealisationSerializer
    permission_classes = [permissions.IsAuthenticated]
