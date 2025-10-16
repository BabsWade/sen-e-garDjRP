from rest_framework import serializers
from .models import Objectif, Realisation


class RealisationSerializer(serializers.ModelSerializer):
    objectif_libelle = serializers.SerializerMethodField()

    class Meta:
        model = Realisation
        fields = '__all__'
        read_only_fields = ['agent', 'est_valide', 'libelle', 'est_rejete', 'commentaire_rejet', 'feedback', 'date_soumission', 'date_validation']

    def get_objectif_libelle(self, obj):
        if obj.objectif:
            return obj.objectif.libelle
        return None