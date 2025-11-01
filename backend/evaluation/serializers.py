# evaluation/serializers.py
from rest_framework import serializers
from .models import AutoEvaluation, Evaluation, NoteFinale, Contestation, HistoriqueEvaluation
from rest_framework.exceptions import ValidationError

class AutoEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutoEvaluation
        fields = '__all__'
        read_only_fields = ['agent']

    def validate(self, data):
        user = self.context['request'].user
        objectif = data.get('objectif')

        # Vérifie que l'objectif appartient bien à l'agent connecté
        if objectif.agent != user:
            raise ValidationError("Vous ne pouvez évaluer qu’un objectif qui vous est attribué.")

        # Vérifie que l'objectif est validé
        if objectif.statut != 'valide':
            raise ValidationError("Vous ne pouvez auto-évaluer que des objectifs validés.")

        # Empêche la duplication
        if AutoEvaluation.objects.filter(agent=user, objectif=objectif).exists():
            raise ValidationError("Auto-évaluation déjà soumise pour cet objectif.")

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['agent'] = user
        return super().create(validated_data)


# ✅ Pour la lecture (list/retrieve)
class AutoEvaluationReadSerializer(serializers.ModelSerializer):
    objectif_libelle = serializers.CharField(source='objectif.libelle', read_only=True)
    objectif_type = serializers.CharField(source='objectif.type_kpi', read_only=True)
    objectif_cible = serializers.CharField(source='objectif.cible', read_only=True)
    date_creation = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = AutoEvaluation
        fields = [
            'id', 'objectif', 'objectif_libelle',
            'objectif_type', 'objectif_cible',
            'note', 'commentaire','date_creation'
        ]

class EvaluationSerializer(serializers.ModelSerializer):
    objectif_libelle = serializers.SerializerMethodField()

    class Meta:
        model = Evaluation
        fields = '__all__'

    def get_objectif_libelle(self, obj):
        if obj.objectif:
            return obj.objectif.libelle
        return None


class NoteFinaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteFinale
        fields = '__all__'

class ContestationSerializer(serializers.ModelSerializer):
    agent = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Contestation
        fields = '__all__'
        read_only_fields = ['agent']

class HistoriqueEvaluationSerializer(serializers.ModelSerializer):
    agent_nom = serializers.CharField(source='agent.nom', read_only=True)
    periode_libelle = serializers.CharField(source='periode.libelle_periode', read_only=True)

    class Meta:
        model = HistoriqueEvaluation
        fields = ['id', 'agent', 'agent_nom', 'periode', 'periode_libelle', 'performance_ponderee', 'date_enregistrement']