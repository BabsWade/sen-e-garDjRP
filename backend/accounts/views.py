from rest_framework import generics
from .serializers import AgentRegisterSerializer
from .models import Agent

class AgentRegisterView(generics.CreateAPIView):
    queryset = Agent.objects.all()
    serializer_class = AgentRegisterSerializer
