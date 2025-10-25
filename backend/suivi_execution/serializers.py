from rest_framework import serializers
from .models import Realisation, Notification


class RealisationSerializer(serializers.ModelSerializer):
    objectif_libelle = serializers.SerializerMethodField()

    class Meta:
        model = Realisation
        fields = '__all__'
        read_only_fields = ['agent', 'est_valide', 'libelle', 'objectif.libelle', 'est_rejete', 'commentaire_rejet', 'feedback', 'date_soumission', 'date_validation']

    def get_objectif_libelle(self, obj):
        if obj.objectif:
            return obj.objectif.libelle
        return None

class NotificationSerializer(serializers.ModelSerializer):
    agent_nom_complet = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'agent',
            'agent_nom_complet',
            'message',
            'date_envoi',
            'statut',
            'lue_le',
        ]
        read_only_fields = ['date_envoi', 'lue_le']

    def get_agent_nom_complet(self, obj):
        return f"{obj.agent.nom} {obj.agent.prenom}"