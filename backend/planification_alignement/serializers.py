from rest_framework import serializers
from .models import Periode, Service, Objectif, Indicateur, PlanStrategique, ObjectifProgramme

from rest_framework import serializers
from accounts.models import Agent, HistoriquePerformance


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
    indicateur = IndicateurSerializer(read_only=True)
    indicateur_id = serializers.PrimaryKeyRelatedField(
        source='indicateur',
        queryset=Indicateur.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    taux_avancement = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)

    class Meta:
        model = Objectif
        fields = '__all__'
        # selon ta logique, tu peux rendre certains champs read_only
        read_only_fields = ['agent', 'statut', 'date_validation', 'date_debut', 'taux_avancement']

    def get_est_valide(self, obj):
        return obj.statut == 'valide'

    def get_est_rejete(self, obj):
        return obj.statut == 'rejete'

class AgentPerformanceSerializer(serializers.ModelSerializer):
    service_nom = serializers.CharField(source='service.nom_service', read_only=True,  required=False,
        allow_null=True)
    responsable_nom = serializers.SerializerMethodField()
    performance_moyenne = serializers.SerializerMethodField()

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
        ]

    def get_responsable_nom(self, obj):
        """
        Retourne le nom complet du responsable hiérarchique s’il existe.
        """
        if obj.responsable:
            return f"{obj.responsable.nom} {obj.responsable.prenom}"
        return "Non défini"

    def get_performance_moyenne(self, obj):
        """
        Retourne la performance pondérée comme un nombre.
        """
        return float(obj.performance_moyenne)

class AgentSousResponsableSerializer(serializers.ModelSerializer):
    service_nom = serializers.CharField(source='service.nom_service', read_only=True)

    class Meta:
        model = Agent
        fields = ['id', 'matricule', 'nom', 'prenom', 'service_nom', 'performance_moyenne', 'etat_agent']


class HistoriquePerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriquePerformance
        fields = ['id', 'agent', 'performance', 'date_calcul']

