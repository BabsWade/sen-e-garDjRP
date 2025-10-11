from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import AgentRegisterSerializer
from .models import Agent
from rest_framework_simplejwt.views import TokenObtainPairView
from .token_serializer import MyTokenObtainPairSerializer
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
