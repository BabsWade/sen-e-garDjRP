from rest_framework import serializers
from .models import Agent
from django.contrib.auth.password_validation import validate_password

class AgentRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Agent
        fields = ('matricule', 'email', 'nom', 'prenom', 'password', 'password2', 'role')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = Agent.objects.create_user(**validated_data)
        return user
