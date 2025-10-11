from rest_framework import serializers
from .models import Periode, Service, Objectif, Realisation


class PeriodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Periode
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class ObjectifSerializer(serializers.ModelSerializer):
    class Meta:
        model = Objectif
        fields = '__all__'
        read_only_fields = ['agent', 'est_valide']
        taux_avancement_total = serializers.IntegerField(source='taux_avancement_total', read_only=True)


class RealisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Realisation
        fields = '__all__'
        read_only_fields = ['agent', 'est_valide', 'est_rejete', 'commentaire_rejet', 'feedback', 'date_soumission', 'date_validation']
