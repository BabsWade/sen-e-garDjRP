from rest_framework import serializers
from .models import Periode, Service, Objectif, Indicateur, PlanStrategique, ObjectifProgramme

from rest_framework import serializers
from accounts.models import Agent, HistoriquePerformance

from suivi_execution.serializers import RealisationSerializer


class PeriodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Periode
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class IndicateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Indicateur
        fields = ['id', 'code', 'libelle', 'description', 'type_kpi', 'cible']

class PlanStrategiqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanStrategique
        fields = '__all__'

class ObjectifProgrammeSerializer(serializers.ModelSerializer):
    plan_strategique = PlanStrategiqueSerializer(read_only=True)
    plan_strategique_id = serializers.PrimaryKeyRelatedField(
        source='plan_strategique',
        queryset=PlanStrategique.objects.all(),
        write_only=True,
        required=False,
        allow_null=True)
    class Meta:
        model = ObjectifProgramme
        fields = '__all__'

class ObjectifSerializer(serializers.ModelSerializer):
    objectif_programme = ObjectifProgrammeSerializer(read_only=True)
    objectif_programme_id = serializers.PrimaryKeyRelatedField(
        source='objectif_programme',
        queryset=ObjectifProgramme.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    plan_strategique = PlanStrategiqueSerializer(read_only=True)
    plan_strategique_id = serializers.PrimaryKeyRelatedField(
        source='plan_strategique',
        queryset=PlanStrategique.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    indicateur = IndicateurSerializer(read_only=True)
    indicateur_id = serializers.PrimaryKeyRelatedField(
        source='indicateur',
        queryset=Indicateur.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    realisations = RealisationSerializer(many=True, read_only=True)
    taux_avancement = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        read_only=True
    )

    # ✅ Champ calculé pour le frontend
    est_assigne = serializers.SerializerMethodField()

    class Meta:
        model = Objectif
        fields = '__all__'
        read_only_fields = [
            'agent',
            'statut',
            'date_validation',
            'date_debut',
            'taux_avancement'
        ]

    # ✅ Méthodes utilitaires
    def get_est_assigne(self, obj):
        """Retourne True si l’objectif est assigné à un agent."""
        return obj.agent is not None

    def get_est_valide(self, obj):
        """Retourne True si l’objectif est validé."""
        return obj.statut == 'valide'

    def get_est_rejete(self, obj):
        """Retourne True si l’objectif est rejeté."""
        return obj.statut == 'rejete'

class AgentPerformanceSerializer(serializers.ModelSerializer):
    service_nom = serializers.CharField(
        source='service.nom_service',
        read_only=True,
        required=False,
        allow_null=True
    )
    responsable_nom = serializers.SerializerMethodField()
    performance_moyenne = serializers.SerializerMethodField()
    taux_realisations_valides = serializers.SerializerMethodField()  # 🟢 Nouveau champ

    class Meta:
        model = Agent
        fields = [
            'id',
            'matricule',
            'nom',
            'prenom',
            'performance_moyenne',
            'service_nom',
            'responsable_nom',
            'superieur_hierarchique',
            'taux_realisations_valides',  # 🟢 Inclure le champ dans l'API
        ]

    def get_responsable_nom(self, obj):
        if obj.responsable:
            return f"{obj.responsable.nom} {obj.responsable.prenom}"
        return "Non défini"

    def get_performance_moyenne(self, obj):
        return float(obj.performance_moyenne)

    def get_taux_realisations_valides(self, obj):
        """
        Calcule le taux de réalisations validées pour l'agent.
        """
        realisations_qs = obj.realisations.all()  # ✅ Utilisation du related_name
        total = realisations_qs.count()
        valides = realisations_qs.filter(est_valide=True).count()
        taux = (valides / total) * 100 if total else 0
        return round(taux, 2)  # on peut arrondir à 2 décimales

class AgentSousResponsableSerializer(serializers.ModelSerializer):
    service_nom = serializers.CharField(source='service.nom_service', read_only=True)

    class Meta:
        model = Agent
        fields = ['id', 'matricule', 'nom', 'prenom', 'service_nom', 'performance_moyenne', 'etat_agent']



class HistoriquePerformanceSerializer(serializers.ModelSerializer):
    taux_realisations_valides = serializers.SerializerMethodField()

    class Meta:
        model = HistoriquePerformance
        fields = ['date_calcul', 'performance', 'taux_realisations_valides']

    def get_taux_realisations_valides(self, obj):
        agent = obj.agent
        # On récupère les réalisations jusqu'à la date du calcul
        realisations = agent.realisations.filter(date_soumission__lte=obj.date_calcul)
        total = realisations.count()
        valides = realisations.filter(est_valide=True).count()
        taux = (valides / total) * 100 if total else 0
        return round(taux, 2)



class ObjectifSuperieurSerializer(serializers.ModelSerializer):
    realisations = RealisationSerializer(many=True, read_only=True)
    agent = serializers.SerializerMethodField()

    class Meta:
        model = Objectif
        fields = ['id', 'libelle', 'type_kpi', 'cible', 'poids', 'taux_avancement',
                  'date_debut', 'date_delai', 'statut', 'commentaire_rejet', 'realisations', 'agent']

    def get_agent(self, obj):
        agent = obj.agent
        return {
            'id': agent.id,
            'nom': agent.nom,
            'prenom': agent.prenom,
            'fonction': agent.fonction,
            'service_nom': agent.service.nom,
            'email': agent.email,
        }

