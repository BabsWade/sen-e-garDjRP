from rest_framework import viewsets, permissions, status, generics
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from rest_framework.views import APIView
from .models import Periode, Service, Objectif, Indicateur, PlanStrategique, ObjectifProgramme
from .serializers import (
    PeriodeSerializer,
    ServiceSerializer,
    ObjectifSerializer,
    IndicateurSerializer, PlanStrategiqueSerializer, ObjectifProgrammeSerializer
)
from .models import Objectif
from accounts.models import Agent

from .serializers import ObjectifSerializer

from .permissions import ObjectifAccessPermission
from .serializers import AgentPerformanceSerializer
from planification_alignement.models import Objectif, Periode
from evaluation.models import NoteFinale

from accounts.models import HistoriquePerformance
from rest_framework.exceptions import PermissionDenied

from suivi_execution.models import Realisation
from suivi_execution.serializers import RealisationSerializer


# Permissions personnalisées
class IsDRH(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "DRH"


class IsResponsable(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "RESPONSABLE_N1"


# ViewSets
class PeriodeViewSet(viewsets.ModelViewSet):
    queryset = Periode.objects.all()

    #queryset = Objectif.periode.field.related_model.objects.all()
    serializer_class = PeriodeSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsDRH()]


class ServiceViewSet(viewsets.ModelViewSet):
    #queryset = Objectif.service.field.related_model.objects.all()
    queryset = Service.objects.all()

    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsDRH]


class IndicateurViewSet(viewsets.ModelViewSet):
    queryset = Indicateur.objects.all()
    serializer_class = IndicateurSerializer
    permission_classes = [IsAuthenticated]

class PlanStrategiqueViewSet(viewsets.ModelViewSet):
    queryset = PlanStrategique.objects.all()
    serializer_class = PlanStrategiqueSerializer
    permissions_classes = [IsAuthenticated]

class ObjectifProgrammeViewSet(viewsets.ModelViewSet):
    queryset = ObjectifProgramme.objects.all()
    serializer_class = ObjectifProgrammeSerializer
    permission_classes = [IsAuthenticated]


class ObjectifViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, ObjectifAccessPermission]
    serializer_class = ObjectifSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == 'DRH':
            return Objectif.objects.all()
        elif user.role == 'RESPONSABLE_N1':
            return Objectif.objects.filter(agent__responsable=user)

            #return Objectif.objects.filter(agent__responsable_matricule=user.matricule)
        elif user.role == 'AGENT':
            return Objectif.objects.filter(agent=user)
        return Objectif.objects.none()

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

        objectif.statut = 'rejete'
        objectif.commentaire_rejet = commentaire
        objectif.date_validation = timezone.now()
        objectif.save()

        return Response({'detail': 'Objectif rejeté avec succès.'}, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        agent = self.request.user
        service = agent.service
        annee = serializer.validated_data['periode'].date_debut.year

        serializer.save(
            agent=agent,
            service=service,
            annee=annee
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.statut == 'valide' and request.user.role == 'AGENT':
            return Response(
                {'detail': "Objectif validé. Vous ne pouvez plus le modifier."},
                status=status.HTTP_403_FORBIDDEN
            )

        if instance.statut == 'rejete' and request.user.role != 'AGENT':
            return Response(
                {'detail': "Objectif déjà rejeté. Il doit être reformulé par l'agent."},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.user != instance.agent:
            return Response({'detail': 'Non autorisé.'}, status=403)
        return super().update(request, *args, **kwargs)


class PerformanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agent = request.user

        # 1️⃣ Calcul de la performance pondérée globale
        agent.calculer_performance_ponderee()
        serializer = AgentPerformanceSerializer(agent)

        # 2️⃣ Historique avec taux de réalisations validées
        historique = []

        # On prend toutes les périodes ou toutes les dates historiques que tu veux
        performances = HistoriquePerformance.objects.filter(agent=agent).order_by('date_calcul')

        for h in performances:
            # Objectifs jusqu'à cette date
            objectifs = Objectif.objects.filter(agent=agent, date_creation__lte=h.date_calcul)
            total_objectifs = objectifs.count()
            objectifs_valides = objectifs.filter(taux_avancement__gte=100).count()

            taux_realisations_valides = (objectifs_valides / total_objectifs * 100) if total_objectifs else 0

            historique.append({
                "date": h.date_calcul,
                "performance": h.performance,
                "taux_realisations_valides": taux_realisations_valides
            })

        return Response({
            **serializer.data,
            "historique": historique
        })
class AgentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agent = request.user

        # 1️⃣ Calcul de la performance
        agent.calculer_performance_ponderee()

        # 2️⃣ Objectifs atteints / total
        objectifs = Objectif.objects.filter(agent=agent, statut = 'valide')
        total_objectifs = objectifs.count()
        objectifs_atteints = objectifs.filter(taux_avancement__gte=100).count()

        # 🧾 Dernière note d’évaluation
        derniere_note = (
            NoteFinale.objects.filter(agent=agent)
            .order_by('-date_evaluation')
            .first()
        )
        note_finale = derniere_note.note_finale if derniere_note else None

        # 4️⃣ Période d’évaluation en cours
        periode_courante = (
            Periode.objects.order_by('-date_debut').first()
        )
        periode_nom = periode_courante.libelle_periode if periode_courante else "Aucune période active"

        serializer = AgentPerformanceSerializer(agent)

        return Response({
            **serializer.data,
            "objectifs_atteints": objectifs_atteints,
            "total_objectifs": total_objectifs,
            "note_finale": note_finale,
            "periode_en_cours": periode_nom,

        })

class AgentsSousResponsableViewSet(viewsets.ViewSet):
    """
    Vue permettant au responsable N+1 de gérer ses agents :
    - Voir le profil complet
    - Voir / Modifier / Supprimer leurs objectifs et réalisations
    - Leur assigner de nouveaux objectifs
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self, request):
        responsable = request.user  # ✅ déjà un Agent
        return Agent.objects.filter(responsable=responsable)

    def list(self, request):
        agents = self.get_queryset(request)
        data = AgentPerformanceSerializer(agents, many=True).data
        return Response(data)

    def retrieve(self, request, pk=None):
        # Profil complet d’un agent + ses objectifs et réalisations
        agent = self.get_queryset(request).filter(pk=pk).first()
        if not agent:
            raise PermissionDenied("Cet agent ne vous est pas rattaché.")

        objectifs = Objectif.objects.filter(agent=agent)
        realisations = Realisation.objects.filter(objectif__agent=agent)

        return Response({
            "agent": AgentPerformanceSerializer(agent).data,
            "objectifs": ObjectifSerializer(objectifs, many=True).data,
            "realisations": RealisationSerializer(realisations, many=True).data
        })

    @action(detail=True, methods=['post'])
    def assigner_objectif(self, request, pk=None):
        # Crée un nouvel objectif pour un agent sous responsabilité
        agent = self.get_queryset(request).filter(pk=pk).first()
        if not agent:
            raise PermissionDenied("Cet agent ne vous est pas rattaché.")
        data = request.data.copy()
        data["agent"] = agent.id
        serializer = ObjectifSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(agent=agent)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['put'], url_path="objectifs/(?P<obj_id>[^/.]+)")
    def modifier_objectif(self, request, pk=None, obj_id=None):
        # Modifier un objectif d’un agent
        agent = self.get_queryset(request).filter(pk=pk).first()
        objectif = Objectif.objects.filter(pk=obj_id, agent=agent).first()
        if not objectif:
            raise PermissionDenied("Objectif non autorisé.")
        serializer = ObjectifSerializer(objectif, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['delete'], url_path="objectifs/(?P<obj_id>[^/.]+)")
    def supprimer_objectif(self, request, pk=None, obj_id=None):
        agent = self.get_queryset(request).filter(pk=pk).first()
        objectif = Objectif.objects.filter(pk=obj_id, agent=agent).first()
        if not objectif:
            raise PermissionDenied("Suppression non autorisée.")
        objectif.delete()
        return Response({"detail": "Objectif supprimé avec succès."}, status=status.HTTP_204_NO_CONTENT)


class ObjectifDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/objectifs/<id>/        → détail objectif
    PUT    /api/objectifs/<id>/        → modifier
    DELETE /api/objectifs/<id>/        → supprimer
    """
    queryset = Objectif.objects.all()
    serializer_class = ObjectifSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        serializer.save()  # tu peux ajouter une logique ici si besoin


class ObjectifRealisationsAPIView(generics.ListAPIView):
    """
    GET /api/objectifs/<id>/realisations/ → liste des réalisations liées
    """
    serializer_class = RealisationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        objectif_id = self.kwargs["pk"]
        return Realisation.objects.filter(objectif_id=objectif_id)