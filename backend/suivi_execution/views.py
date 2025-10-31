from django.db.models import Q, Sum
from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .serializers import NotificationSerializer, HistoriqueTauxExecutionSerializer
from rest_framework.decorators import api_view, permission_classes
from planification_alignement.models import Objectif

from .models import Realisation, Notification, HistoriqueTauxExecution
from .serializers import RealisationSerializer
from accounts.models import HistoriquePerformance

from rest_framework.views import APIView

from accounts.models import Agent


class RealisationViewSet(viewsets.ModelViewSet):
    serializer_class = RealisationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = (
            Realisation.objects
            .select_related('agent', 'objectif', 'objectif__agent', 'objectif__service', 'objectif__periode')
        )
        objectif_id = self.request.query_params.get('objectif')
        if objectif_id:
            queryset = queryset.filter(objectif_id=objectif_id)

        if user.role == 'DRH':
            return queryset
        if user.role in ['RESPONSABLE_N1', 'AGENT'] and getattr(user, 'superieur_hierarchique', False):
            return queryset.filter(
                Q(agent=user) | Q(objectif__agent=user) | Q(objectif__agent__responsable=user)
            ).distinct()
        return queryset.filter(Q(agent=user) | Q(objectif__agent=user)).distinct()

    def perform_create(self, serializer):
        """Assigne automatiquement l'agent connecté lors de la création."""
        agent = self.request.user  # ✅ puisque Agent = User
        serializer.save(agent=agent)


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Si l'utilisateur est un agent, renvoyer uniquement ses notifications.
        Sinon, renvoyer tout (ex: pour un administrateur).
        """
        user = self.request.user

        # Ton user EST un Agent
        if isinstance(user, Agent):
            return Notification.objects.filter(agent=user).order_by('-date_envoi')

        # Si tu as un superadmin (DRH ou admin global)
        if user.is_superuser or getattr(user, 'role', None) == 'DRH':
            return Notification.objects.all().order_by('-date_envoi')

        return Notification.objects.none()

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
    #agent = request.user.agent  # selon ta relation User → Agent
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


class TauxExecutionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agent = request.user
        historiques = HistoriquePerformance.objects.filter(agent=agent).order_by('date_calcul')
        data = []

        for h in historiques:
            # Objectifs actifs et validés à cette date
            objectifs = Objectif.objects.filter(
                agent=agent,
                date_debut__lte=h.date_calcul,
                statut='valide'
            )

            total_cible = objectifs.aggregate(total=Sum('cible'))['total'] or 0

            objectifs_ids = objectifs.values_list('id', flat=True)
            total_realise = Realisation.objects.filter(
                objectif_id__in=objectifs_ids,
                est_valide=True,
                date_validation__lte=h.date_calcul
            ).count()

            taux_realisations_objectifs_valides = round((total_realise / total_cible) * 100, 2) if total_cible else 0

            data.append({
                "date_calcul": h.date_calcul,
                "performance": float(h.performance),
                "taux_realisations_objectifs_valides": taux_realisations_objectifs_valides
            })

        return Response(data)

class TauxExecutionCacheAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agent = request.user
        historique = HistoriqueTauxExecution.objects.filter(agent=agent).order_by('date_calcul')
        serializer = HistoriqueTauxExecutionSerializer(historique, many=True)
        return Response(serializer.data)

class AgentHistoriqueTauxExecutionAPIView(APIView):
    """
    Retourne l'historique du taux d'exécution des objectifs validés
    pour l'agent connecté, calculé dynamiquement à chaque requête.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agent = request.user

        # Récupération des objectifs de l'agent, ordre par date_debut
        objectifs = Objectif.objects.filter(agent=agent, statut='valide').order_by('date_debut')

        data = []

        for obj in objectifs:
            # Réalisations validées de cet objectif
            nb_real_valide = Realisation.objects.filter(objectif=obj, est_valide=True).count()
            nb_cible = obj.cible or 0

            taux_execution = round((nb_real_valide / nb_cible) * 100, 2) if nb_cible else 0

            data.append({
                "objectif_id": obj.id,
                "objectif_libelle": obj.libelle,
                "date_debut": obj.date_debut,
                "date_delai": obj.date_delai,
                "taux_execution": taux_execution,
            })



        return Response(data)