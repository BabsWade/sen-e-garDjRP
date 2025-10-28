from django.urls import path
from .views import (
    AgentRegisterView,
    CurrentUserView,
    ActivateAccountView,
    SetPasswordView, AgentPerformanceView, SubordonnesListAPIView, AgentDetailAPIView,
)
from suivi_execution import views

urlpatterns = [
    path('register/', AgentRegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('activate/<uidb64>/<token>/', ActivateAccountView.as_view(), name='activate'),

    path('set-password/', SetPasswordView.as_view(), name='set_password'),
    #path('performance-agent/', AgentPerformanceView.as_view(), name='performance-agent'),
    path('performances-agent/', AgentPerformanceView.as_view(), name='performances-agent'),
    path('agent-notifications/', views.agent_notifications, name='agent-notifications'),
    path('mes-agents/', SubordonnesListAPIView.as_view(), name='mes-agents'),
    path('agent/<int:agent_id>/details/', AgentDetailAPIView.as_view(), name='agent-details'),

]