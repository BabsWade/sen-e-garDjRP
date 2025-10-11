from rest_framework import serializers
from .models import Agent
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.models import BaseUserManager

class AgentRegisterSerializer(serializers.ModelSerializer):
    email2 = serializers.EmailField(write_only=True, required=True, label="Confirmer l'email")

    class Meta:
        model = Agent
        fields = ('matricule', 'prenom', 'nom', 'email', 'email2', 'role')

    def validate(self, attrs):
        if attrs['email'] != attrs['email2']:
            raise serializers.ValidationError({"email": "Les emails ne correspondent pas."})

        if Agent.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Cet email est déjà utilisé."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('email2')
        user = Agent.objects.create(
            matricule=validated_data['matricule'],
            prenom=validated_data['prenom'],
            nom=validated_data['nom'],
            email=validated_data['email'],
            role=validated_data.get('role', 'AGENT'),
            is_active=False  # Compte inactif tant qu'il n'a pas activé son compte
        )
        user.set_unusable_password()  # Pas de mot de passe temporaire, impossible de se connecter avant activation
        user.save()

        # Générer le token d'activation
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        activation_link = f"{settings.FRONTEND_URL}/activation/{uid}/{token}/"

        # Envoi du mail
        send_mail(
            subject="Activation de votre compte",
            message=f"Bonjour {user.prenom},\n\nMerci de vous être inscrit.\nCliquez sur le lien suivant pour activer votre compte :\n{activation_link}\n\nCe lien expire dans 30 minutes.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )

        return user


