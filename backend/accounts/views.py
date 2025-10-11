from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import AgentRegisterSerializer
from .models import Agent
from rest_framework_simplejwt.views import TokenObtainPairView
from .token_serializer import MyTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

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
