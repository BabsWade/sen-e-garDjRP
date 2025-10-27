from rest_framework import serializers
from .models import Agent, HistoriquePerformance
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.models import BaseUserManager
from rest_framework import serializers
from .models import Agent
from planification_alignement.serializers import ObjectifSerializer
from suivi_execution.serializers import RealisationSerializer
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

class AgentPerformanceSerializer(serializers.ModelSerializer):
    service_nom = serializers.CharField(source='service.nom_service', read_only=True)
    responsable_nom = serializers.SerializerMethodField()
    taux_realisations_valides = serializers.SerializerMethodField()

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
            'taux_realisations_valides',
        ]
        read_only_fields = ['performance_moyenne']

    def get_responsable_nom(self, obj):
        """Retourne le nom complet du responsable hiérarchique s’il existe."""
        if obj.responsable:
            return f"{obj.responsable.nom} {obj.responsable.prenom}"
        return "Non défini"

    def get_taux_realisations_valides(self, obj):
        """
        Calcule le taux de réalisations validées de l'agent
        en se basant sur les réalisations validées de ses objectifs
        et la somme des cibles de ces objectifs.
        """
        objectifs = obj.objectifs_planification.all()
        if not objectifs.exists():
            return 0.0

        total_cibles = sum(objo.cible or 0 for objo in objectifs)
        if total_cibles == 0:
            return 0.0

        total_realisations_valides = sum(
            objo.realisations.filter(est_valide=True).count()
            for objo in objectifs
        )

        taux = (total_realisations_valides / total_cibles) * 100
        return round(taux, 2)

class AgentSousResponsableSerializer(serializers.ModelSerializer):
    service_nom = serializers.CharField(source='service.nom_service', read_only=True)

    class Meta:
        model = Agent
        fields = ['id', 'matricule', 'nom', 'prenom', 'service_nom', 'performance_moyenne', 'etat_agent']


class HistoriquePerformanceSerializer(serializers.ModelSerializer):
    taux_realisations_valides = serializers.SerializerMethodField()

    class Meta:
        model = HistoriquePerformance
        fields = ['id', 'agent', 'performance', 'date_calcul', 'taux_realisations_valides']

    def get_taux_realisations_valides(self, obj):
        """Calcule le taux de réalisations validées à la date de l’enregistrement."""
        agent = obj.agent
        from planification_alignement.models import Objectif
        objectifs = Objectif.objects.filter(agent=agent, date_creation__lte=obj.date_calcul)
        total = objectifs.count()
        valides = objectifs.filter(taux_avancement__gte=100).count()
        return round(valides / total * 100, 2) if total else 0

class AgentDetailSerializer(serializers.ModelSerializer):
    service_nom = serializers.CharField(source='service.nom_service', read_only=True)
    responsable_nom = serializers.SerializerMethodField()
    taux_realisations_valides = serializers.SerializerMethodField()
    objectifs = serializers.SerializerMethodField()
    realisations = serializers.SerializerMethodField()

    class Meta:
        model = Agent
        fields = [
            'id',
            'matricule',
            'nom',
            'prenom',
            'email',
            'role',
            'date_embauche',
            'etat_agent',
            'service_nom',
            'responsable_nom',
            'performance_moyenne',
            'taux_realisations_valides',
            'objectifs',
            'realisations'
        ]

    def get_responsable_nom(self, obj):
        if obj.responsable:
            return f"{obj.responsable.nom} {obj.responsable.prenom}"
        return "Non défini"

    def get_taux_realisations_valides(self, obj):
        return obj.taux_realisations_valides()

    def get_objectifs(self, obj):
        return ObjectifSerializer(obj.objectifs_planification.all(), many=True).data

    def get_realisations(self, obj):
        from suivi_execution.models import Realisation
        realisations = Realisation.objects.filter(objectif__in=obj.objectifs_planification.all())
        return RealisationSerializer(realisations, many=True).data