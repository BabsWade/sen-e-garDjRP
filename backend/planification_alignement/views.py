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
    IndicateurSerializer, PlanStrategiqueSerializer, ObjectifProgrammeSerializer, ObjectifSuperieurSerializer,
    HistoriquePerformanceSerializer
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

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Objectif
from .serializers import ObjectifSerializer
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
        elif user.role == 'AGENT':
            return Objectif.objects.filter(agent=user)
        return Objectif.objects.none()

    def perform_create(self, serializer):
        agent = self.request.user
        service = agent.service
        annee = serializer.validated_data['periode'].date_debut.year

        serializer.save(agent=agent, service=service, annee=annee)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['periodes_en_cours'] = Periode.objects.filter(statut_periode='en_cours')
        return context

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user

        # Objectif validé → seul DRH ou supérieur peut modifier
        if instance.statut == 'valide' and not user.superieur_hierarchique and user.role != 'DRH':
            return Response(
                {'detail': "Objectif validé. Vous ne pouvez plus le modifier."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Objectif rejeté → seul l’agent peut le reformuler
        if instance.statut == 'rejete' and user != instance.agent:
            return Response(
                {'detail': "Objectif rejeté. Il doit être reformulé par l'agent."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Autoriser l’agent, son responsable, ou un supérieur hiérarchique
        if user != instance.agent and user != instance.agent.responsable and not user.superieur_hierarchique:
            return Response({'detail': 'Non autorisé.'}, status=403)

        # 🟢 Si l’objectif était "rejete" et que l’agent le modifie → repasse à "en_attente"
        data = request.data.copy()
        if instance.statut == "rejete" and user == instance.agent:
            data["statut"] = "en_attente"

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='valider')
    def valider_objectif(self, request, pk=None):
        """
        Le supérieur hiérarchique ou le responsable N+1 valide un objectif.
        """
        objectif = self.get_object()
        user = request.user

        # Vérification : seul supérieur hiérarchique ou N+1 autorisé
        if not user.superieur_hierarchique and user.role != "RESPONSABLE_N1":
            return Response(
                {'detail': "Accès refusé : vous n'êtes pas autorisé à valider cet objectif."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérifie la relation hiérarchique
        if objectif.agent.responsable != user and not user.superieur_hierarchique:
            return Response(
                {'detail': "Cet agent n'est pas sous votre supervision."},
                status=status.HTTP_403_FORBIDDEN
            )

        objectif.statut = 'valide'
        objectif.date_validation = timezone.now()
        objectif.commentaire_rejet = ""
        objectif.save()

        return Response({'detail': 'Objectif validé avec succès.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='rejeter')
    def rejeter_objectif(self, request, pk=None):
        """
        Le supérieur hiérarchique ou le responsable N+1 rejette un objectif.
        """
        objectif = self.get_object()
        user = request.user

        # Vérification : seul supérieur hiérarchique ou N+1 autorisé
        if not user.superieur_hierarchique and user.role != "RESPONSABLE_N1":
            return Response(
                {'detail': "Accès refusé : vous n'êtes pas autorisé à rejeter cet objectif."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérifie la relation hiérarchique
        if objectif.agent.responsable != user and not user.superieur_hierarchique:
            return Response(
                {'detail': "Cet agent n'est pas sous votre supervision."},
                status=status.HTTP_403_FORBIDDEN
            )

        commentaire = request.data.get('commentaire_rejet', '').strip()
        if not commentaire:
            return Response(
                {'detail': "Le commentaire de rejet est obligatoire."},
                status=status.HTTP_400_BAD_REQUEST
            )

        objectif.statut = 'rejete'
        objectif.commentaire_rejet = commentaire
        objectif.date_validation = timezone.now()
        objectif.save()

        return Response({'detail': 'Objectif rejeté avec succès.'}, status=status.HTTP_200_OK)

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


# planification_alignement/views.py


class DashboardAgentView(APIView):
    """
    Endpoint pour récupérer la liste des agents avec leur performance et taux de réalisations validées.
    """
    def get(self, request, *args, **kwargs):
        # Récupérer tous les agents
        agents = Agent.objects.all()

        # Sérialiser les données
        serializer = AgentPerformanceSerializer(agents, many=True)

        # Renvoyer la réponse
        return Response({
            "agents": serializer.data
        })





class AgentsSousResponsableViewSet(viewsets.ViewSet):
    """
    Vue permettant aux responsables hiérarchiques (RESPONSABLE_N1 ou agents supérieurs hiérarchiques)
    de gérer leurs agents :
    - Voir le profil complet
    - Voir / Modifier / Supprimer leurs objectifs et réalisations
    - Leur assigner de nouveaux objectifs
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self, request):
        responsable = request.user

        # ✅ Si ce n’est ni un RESPONSABLE_N1 ni un supérieur hiérarchique → accès interdit
        if responsable.role != 'RESPONSABLE_N1' and not responsable.superieur_hierarchique:
            raise PermissionDenied("Accès non autorisé. Réservé aux responsables hiérarchiques.")

        return Agent.objects.filter(responsable=responsable)

    def list(self, request):
        agents = self.get_queryset(request)
        data = AgentPerformanceSerializer(agents, many=True).data
        return Response(data)

    def retrieve(self, request, pk=None):
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
    permission_classes = [permissions.IsAuthenticated, ObjectifAccessPermission]




    def perform_update(self, serializer):
        serializer.save()  # tu peux ajouter une logique ici si besoin


class ObjectifRealisationsAPIView(generics.ListAPIView):
    serializer_class = RealisationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        objectif_id = self.kwargs["pk"]
        from planification_alignement.models import Objectif
        objectif = Objectif.objects.filter(id=objectif_id).first()

        if not objectif:
            return Realisation.objects.none()

        # 🟢 DRH → accès complet
        if user.role == "DRH":
            return Realisation.objects.filter(objectif=objectif)

        # 🟢 RESPONSABLE_N1 → accès aux réalisations de ses subordonnés
        if user.role == "RESPONSABLE_N1" and objectif.agent.responsable == user:
            return Realisation.objects.filter(objectif=objectif)

        # 🟢 AGENT (y compris ceux ayant superieur_hierarchique = True)
        if user.role == "AGENT":
            # ✅ accès à ses propres objectifs
            if objectif.agent == user:
                return Realisation.objects.filter(objectif=objectif)

        # 🚫 Sinon : aucun accès
        return Realisation.objects.none()

class ObjectifWithRealisationsForSuperior(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            objectif = Objectif.objects.get(pk=pk)
        except Objectif.DoesNotExist:
            return Response({"detail": "Objectif non trouvé"}, status=404)

        agent = objectif.agent  # l'agent propriétaire de l'objectif
        superieur = request.user.agent  # l'agent connecté

        # Vérification : l'utilisateur est bien le supérieur hiérarchique
        #if not agent.superieur_hierarchique or agent.responsable != superieur:
           # raise PermissionDenied("Vous n'êtes pas autorisé à voir cet objectif.")
        if not superieur.superieur_hierarchique or agent.responsable != superieur:
            raise PermissionDenied("Vous n'êtes pas autorisé à voir cet objectif.")

        # Sérialisation de l'objectif
        objectif_data = ObjectifSerializer(objectif).data

        # Sérialisation des réalisations liées
        realisations = Realisation.objects.filter(objectif=objectif)
        objectif_data['realisations'] = RealisationSerializer(realisations, many=True).data

        return Response(objectif_data)


class ObjectifDetailForSuperior(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        superieur = request.user

        # Vérification que l’utilisateur est bien un supérieur hiérarchique
        if not superieur.superieur_hierarchique:
            raise PermissionDenied("Accès refusé : vous n’êtes pas un supérieur hiérarchique.")

        try:
            objectif = Objectif.objects.select_related("agent").get(pk=pk)
        except Objectif.DoesNotExist:
            return Response({"detail": "Objectif introuvable."}, status=404)

        agent = objectif.agent

        # Vérification que le supérieur est bien le responsable de cet agent
        if agent.responsable != superieur:
            raise PermissionDenied("Cet objectif ne vous appartient pas.")

        # Sérialisation des données
        agent_data = {
            "id": agent.id,
            "nom": agent.nom,
            "prenom": agent.prenom,
            "matricule": agent.matricule,
            "performance_moyenne": agent.performance_moyenne or 0,
            "service_nom": agent.service.nom_service if agent.service else None,

            "responsable_nom": f"{agent.responsable.prenom} {agent.responsable.nom}" if agent.responsable else None,
            "superieur_hierarchique": agent.superieur_hierarchique,
        }

        realisations = Realisation.objects.filter(objectif=objectif)
        realisations_data = RealisationSerializer(realisations, many=True).data

        objectif_data = {
            "id": objectif.id,
            "libelle": objectif.libelle,
            "taux_avancement": objectif.taux_avancement,
            "statut": objectif.statut,
            "poids": objectif.poids,
            "cible": objectif.cible,
            "type_kpi": objectif.type_kpi,
            "date_debut": objectif.date_debut,
            "date_delai": objectif.date_delai,
            "realisations": realisations_data
        }

        return Response({
            "agent": agent_data,
            "objectif": objectif_data
        })

class ValiderObjectifAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        superieur = request.user

        # Vérifier que l'utilisateur est un supérieur hiérarchique
        if not superieur.superieur_hierarchique:
            raise PermissionDenied("Accès refusé : vous n’êtes pas un supérieur hiérarchique.")

        try:
            objectif = Objectif.objects.select_related("agent").get(pk=pk)
        except Objectif.DoesNotExist:
            return Response({"detail": "Objectif introuvable."}, status=status.HTTP_404_NOT_FOUND)

        # Vérifier que le supérieur est bien responsable de l'agent
        if objectif.agent.responsable != superieur:
            raise PermissionDenied("Cet objectif ne vous appartient pas.")

        # Valider l’objectif
        objectif.statut = "valide"
        objectif.save()

        return Response(
            {"message": f"L’objectif « {objectif.libelle} » a été validé avec succès."},
            status=status.HTTP_200_OK
        )

class RejeterObjectifAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        superieur = request.user

        if not superieur.superieur_hierarchique:
            raise PermissionDenied("Accès refusé : vous n’êtes pas un supérieur hiérarchique.")

        try:
            objectif = Objectif.objects.select_related("agent").get(pk=pk)
        except Objectif.DoesNotExist:
            return Response({"detail": "Objectif introuvable."}, status=status.HTTP_404_NOT_FOUND)

        if objectif.agent.responsable != superieur:
            raise PermissionDenied("Cet objectif ne vous appartient pas.")

        motif = request.data.get("motif", "").strip()
        objectif.statut = "rejete"
        objectif.motif_rejet = motif
        objectif.save()

        return Response(
            {
                "message": f"L’objectif « {objectif.libelle} » a été rejeté.",
                "motif_rejet": motif
            },
            status=status.HTTP_200_OK
        )

class ObjectifModifierForSuperior(APIView):
    """
    Permet au supérieur hiérarchique de modifier un objectif d’un agent sous sa responsabilité.
    """
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        superieur = request.user

        # ✅ Vérifie que l'utilisateur est bien un supérieur hiérarchique
        if not superieur.superieur_hierarchique:
            raise PermissionDenied("Accès refusé : vous n’êtes pas un supérieur hiérarchique.")

        try:
            objectif = Objectif.objects.select_related("agent").get(pk=pk)
        except Objectif.DoesNotExist:
            return Response({"detail": "Objectif introuvable."}, status=404)

        agent = objectif.agent

        # ✅ Vérifie que le supérieur est bien le responsable de cet agent
        if agent.responsable != superieur:
            raise PermissionDenied("Cet agent n'est pas sous votre supervision.")

        # ✅ Données modifiables uniquement
        data = request.data
        champs_modifiables = [
            "libelle", "poids", "cible", "type_kpi",
            "date_debut", "date_delai"
        ]

        for champ in champs_modifiables:
            if champ in data:
                setattr(objectif, champ, data[champ])

        objectif.date_validation = timezone.now()
        objectif.save()

        return Response(
            {"detail": "Objectif modifié avec succès."},
            status=status.HTTP_200_OK
        )
# ✅ Endpoint séparé (si tu veux l’appeler explicitement depuis le frontend)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def modifier_objectif(request, pk):
    """
    Permet à un responsable (N+1) ou DRH de modifier un objectif d’un agent subordonné.
    Si un objectif était 'rejete' et que l’agent le modifie → revient à 'en_attente'.
    """
    try:
        objectif = Objectif.objects.get(pk=pk)
    except Objectif.DoesNotExist:
        return Response({"detail": "Objectif non trouvé."}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    agent = objectif.agent

    # 🚫 Seuls le DRH ou le responsable N+1 du subordonné peuvent modifier
    if not (user.role == 'DRH' or user == agent.responsable or user == agent):
        return Response(
            {"detail": "Accès refusé. Seuls le DRH, le responsable N+1 ou l’agent concerné peuvent modifier."},
            status=status.HTTP_403_FORBIDDEN
        )

    data = request.data.copy()

    # 🟢 Si rejeté et modifié par l’agent → statut revient à "en_attente"
    if objectif.statut == "rejete" and user == agent:
        data["statut"] = "en_attente"

    champs_autorises = ['libelle', 'cible', 'poids', 'type_kpi', 'date_debut', 'date_delai']
    for champ in list(data.keys()):
        if champ not in champs_autorises + ['statut']:
            data.pop(champ)

    serializer = ObjectifSerializer(objectif, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Objectif modifié avec succès.", "objectif": serializer.data})
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- VUE : Lister et créer les objectifs des agents supervisés ---
class ObjectifsSousResponsableAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Liste tous les objectifs des agents sous la responsabilité du supérieur"""
        user = request.user
        if not user.superieur_hierarchique:
            raise PermissionDenied("Accès refusé : vous n’êtes pas un supérieur hiérarchique.")

        # Récupérer les agents supervisés
        agents = Agent.objects.filter(responsable=user)
        objectifs = Objectif.objects.filter(agent__in=agents).select_related("agent")

        data = []
        for obj in objectifs:
            data.append({
                "id": obj.id,
                "libelle": obj.libelle,
                "agent": f"{obj.agent.prenom} {obj.agent.nom}",
                "statut": obj.statut,
                "type_kpi": obj.type_kpi,
                "cible": obj.cible,
                "poids": obj.poids,
                "taux_avancement": obj.taux_avancement,
            })
        return Response(data, status=200)

    def post(self, request):
        """Créer un nouvel objectif pour un agent sous sa responsabilité"""
        user = request.user
        if not user.superieur_hierarchique:
            raise PermissionDenied("Accès refusé : vous n’êtes pas un supérieur hiérarchique.")

        data = request.data
        agent_id = data.get("agent")

        try:
            agent = Agent.objects.get(id=agent_id)
        except Agent.DoesNotExist:
            return Response({"detail": "Agent introuvable."}, status=404)

        if agent.responsable != user:
            raise PermissionDenied("Vous ne pouvez créer un objectif que pour vos subordonnés.")

        serializer = ObjectifSerializer(data=data)
        if serializer.is_valid():
            objectif = serializer.save(agent=agent, statut="en_attente")
            return Response(ObjectifSerializer(objectif).data, status=201)
        return Response(serializer.errors, status=400)
# === Valider une réalisation ===
class ValiderRealisationView(generics.UpdateAPIView):
    queryset = Realisation.objects.all()
    serializer_class = RealisationSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        realisation = self.get_object()
        realisation.est_valide = True
        realisation.est_rejete = False
        realisation.commentaire_rejet = ""
        realisation.save()
        return Response({'message': 'Réalisation validée avec succès'}, status=status.HTTP_200_OK)


# === Rejeter une réalisation ===
class RejeterRealisationView(generics.UpdateAPIView):
    queryset = Realisation.objects.all()
    serializer_class = RealisationSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        realisation = self.get_object()
        commentaire = request.data.get('commentaire_rejet', '')
        realisation.est_valide = False
        realisation.est_rejete = True
        realisation.commentaire_rejet = commentaire
        realisation.save()
        return Response({'message': 'Réalisation rejetée avec succès'}, status=status.HTTP_200_OK)


# === Modifier une réalisation ===
class ModifierRealisationView(generics.UpdateAPIView):
    queryset = Realisation.objects.all()
    serializer_class = RealisationSerializer
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        realisation = self.get_object()
        description = request.data.get('description', realisation.description)
        realisation.description = description
        realisation.save()
        return Response({'message': 'Réalisation modifiée avec succès'}, status=status.HTTP_200_OK)




class HistoriquePerformancesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agent = request.user
        historique = HistoriquePerformance.objects.filter(agent=agent).order_by('date_calcul')
        serializer = HistoriquePerformanceSerializer(historique, many=True)
        return Response(serializer.data)
