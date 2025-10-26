from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import AgentRegisterSerializer, AgentPerformanceSerializer
from .models import Agent
from rest_framework_simplejwt.views import TokenObtainPairView
from .token_serializers import MyTokenObtainPairSerializer
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import get_object_or_404
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Agent
from rest_framework.permissions import AllowAny
from django.utils.encoding import force_str
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from planification_alignement.models import Objectif
from planification_alignement.serializers import ObjectifSerializer
from suivi_execution.models import Realisation
from suivi_execution.serializers import RealisationSerializer
from .models import HistoriquePerformance
from .serializers import HistoriquePerformanceSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# Vue pour activer le compte (étape 1)
class ActivateAccountView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = Agent.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, Agent.DoesNotExist):
            return Response({"error": "Lien invalide"}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            return Response({"message": "Lien valide", "uid": uidb64, "token": token})
        else:
            return Response({"error": "Lien invalide ou expiré"}, status=status.HTTP_400_BAD_REQUEST)

# Vue pour définir le mot de passe après activation

class SetPasswordView(APIView):
    permission_classes = [AllowAny]

    class InputSerializer(serializers.Serializer):
        uid = serializers.CharField()
        token = serializers.CharField()
        password = serializers.CharField(write_only=True)
        password2 = serializers.CharField(write_only=True)

        def validate(self, data):
            if data['password'] != data['password2']:
                raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
            validate_password(data['password'])
            return data

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = force_str(urlsafe_base64_decode(serializer.validated_data['uid']))
        token = serializer.validated_data['token']
        user = get_object_or_404(Agent, pk=uid)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Token invalide ou expiré"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['password'])
        user.is_active = True
        user.save()

        return Response({"message": "Mot de passe défini avec succès"}, status=status.HTTP_200_OK)


class AgentRegisterView(generics.CreateAPIView):
    queryset = Agent.objects.all()
    serializer_class = AgentRegisterSerializer

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "matricule": user.matricule,
            "email": user.email,
            "nom": user.nom,
            "prenom": user.prenom,
            "role": user.role,
        })

class AgentPerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agent = request.user
        print("Agent connecté :", agent)
        print("Matricule :", agent.matricule)
        print("Nom :", agent.nom)
        print("Prénom :", agent.prenom)
        agent.calculer_performance_ponderee()
        serializer = AgentPerformanceSerializer(agent)
        print("Données sérialisées :", serializer.data)
        return Response(serializer.data)

# 1) Objectifs de l'agent connecté
class AgentObjectifsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agent = request.user
        objectifs = Objectif.objects.filter(agent=agent).select_related('indicateur', 'service', 'periode')
        serializer = ObjectifSerializer(objectifs, many=True)
        return Response(serializer.data)

# 2) Feedbacks (réalisations qui ont un feedback)
class AgentFeedbacksAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agent = request.user
        realisations = (
            Realisation.objects
            .filter(agent=agent)
            .exclude(feedback__isnull=True)
            .select_related('objectif', 'objectif__service')
        )
        serializer = RealisationSerializer(realisations, many=True)
        return Response(serializer.data)

# 3) Historique des performances de l'agent

class AgentHistoriquePerformanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agent = request.user
        historiques = HistoriquePerformance.objects.filter(agent=agent).order_by('date_calcul')

        data = []
        for h in historiques:
            # Tous les objectifs actifs à la date donnée
            objectifs = Objectif.objects.filter(agent=agent, date_debut__lte=h.date_calcul)

            total_cible = 0
            total_realise = 0

            for obj in objectifs:
                # 🔹 Récupérer les réalisations validées liées à cet objectif
                realisations_valides = Realisation.objects.filter(objectif=obj, est_valide=True)
                # 🔹 Compter combien ont été validées
                total_realise += realisations_valides.count()
                # 🔹 Ajouter la cible de l’objectif
                total_cible += getattr(obj, 'cible', 0) or 0  # protège contre None

            taux_realisations_valides = round((total_realise / total_cible) * 100, 2) if total_cible else 0

            data.append({
                "date_calcul": h.date_calcul,
                "performance": float(h.performance),
                "taux_realisations_valides": taux_realisations_valides
            })

        return Response(data)