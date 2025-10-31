"""
URL configuration for senegar project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from accounts.views import (MyTokenObtainPairView, AgentObjectifsAPIView,
    AgentFeedbacksAPIView,
    AgentHistoriquePerformanceAPIView,)

from suivi_execution import views

from accounts.views import AgentDetailAPIView

from planification_alignement.views import ObjectifRealisationsAPIView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth JWT
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # App accounts
    path('api/accounts/', include('accounts.urls')),  # à créer dans l'étape suivante

    path('api/performance/', include('performance.urls')),
    path('api/', include('planification_alignement.urls')),  # ← Assure-toi que ceci est présent
    path('api/', include('suivi_execution.urls')),  # 👈 AJOUTE CELUI-CI
    path('api/', include('evaluation.urls')),  # 👈 AJOUTE CELUI-CI
path('api/agent-objectifs/', AgentObjectifsAPIView.as_view(), name='agent-objectifs-root'),
path("agent-objectifs/<int:pk>/realisations/", ObjectifRealisationsAPIView.as_view(), name="objectif-realisations"),

    path('api/agent-feedbacks/', AgentFeedbacksAPIView.as_view(), name='agent-feedbacks-root'),
    path('api/agent-historique-performances/', AgentHistoriquePerformanceAPIView.as_view(), name='agent-historique-root'),
    path('agent-notifications/', views.agent_notifications, name='agent-notifications'),
    path('agent-details/<int:agent_id>/', AgentDetailAPIView.as_view(), name='agent-details'),
    path('api/suivi_execution/', include('suivi_execution.urls')),  # ✅ nouvelle API

]
