from rest_framework import serializers
from .models import Periode, Service, Objectif, Indicateur



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