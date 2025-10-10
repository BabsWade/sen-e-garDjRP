from django.urls import path
from .views import AgentRegisterView

urlpatterns = [
    path('register/', AgentRegisterView.as_view(), name='register'),
]
