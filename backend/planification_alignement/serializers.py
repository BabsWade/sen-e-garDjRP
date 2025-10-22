from rest_framework import serializers
from .models import Periode, Service, Objectif, Indicateur

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
        fields = [
            'id', 'libelle', 'type_kpi', 'cible', 'poids',
            'service', 'agent', 'periode',
            'est_valide', 'est_rejete', 'commentaire_rejet', 'date_validation',
            'competences_comportementales',
            'indicateur', 'indicateur_id',
            'taux_avancement',
        ]
        # selon ta logique, tu peux rendre certains champs read_only
        read_only_fields = ['agent', 'service', 'est_valide', 'date_validation', 'taux_avancement']


class AgentPerformanceSerializer(serializers.ModelSerializer):
    service_nom = serializers.CharField(source='service.nom_service', read_only=True)
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

class HistoriquePerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriquePerformance
        fields = ['id', 'agent', 'performance', 'date_calcul']
