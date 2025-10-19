# evaluation/serializers.py
from rest_framework import serializers
from .models import AutoEvaluation, Evaluation, NoteFinale, Contestation

class AutoEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutoEvaluation
        fields = '__all__'
        read_only_fields = ['agent']

        def create(self, validated_data):
            user = self.context['request'].user
            validated_data['agent'] = user
            return super().create(validated_data)

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