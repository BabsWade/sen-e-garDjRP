from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PeriodeViewSet, ServiceViewSet, ObjectifViewSet, PerformanceAPIView, IndicateurViewSet, \
    AgentDashboardView, PlanStrategiqueViewSet, ObjectifProgrammeViewSet, ObjectifDetailAPIView, \
    ObjectifRealisationsAPIView, ObjectifWithRealisationsForSuperior, ObjectifDetailForSuperior, RejeterObjectifAPIView, \
    ValiderObjectifAPIView, ObjectifModifierForSuperior, modifier_objectif, ObjectifsSousResponsableAPIView, \
    RejeterRealisationView, ValiderRealisationView, \
    ModifierRealisationView
from suivi_execution import views
from .views import AgentsSousResponsableViewSet

router = DefaultRouter()
router.register(r'periodes', PeriodeViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'objectifs', ObjectifViewSet, basename='objectif')
router.register(r'indicateurs', IndicateurViewSet)
router.register(r'agent-objectifs', ObjectifViewSet, basename='agent-objectifs')
router.register('planstrategique', PlanStrategiqueViewSet, basename='planstrategique')
router.register('objectifprogramme', ObjectifProgrammeViewSet, basename='objectifprogramme')
router.register(r'agents-sous-responsable', AgentsSousResponsableViewSet, basename='agents-sous-responsable')

urlpatterns = [
    path('', include(router.urls)),
    path('performance-agent/', PerformanceAPIView.as_view(), name='performance'),
    path('dashboard-agent/', AgentDashboardView.as_view(), name='dashboard-agent'),
    path('agent-notifications/', views.agent_notifications, name='agent-notifications'),
    path('objectifs/<int:pk>/', ObjectifDetailAPIView.as_view(), name='objectif-detail'),
    path('objectifs/<int:pk>/realisations/', ObjectifRealisationsAPIView.as_view(), name='objectif-realisations'),

    # Supérieur hiérarchique
    path('objectifs-superieur/<int:pk>/', ObjectifDetailForSuperior.as_view(), name='objectifs-superieur-detail'),
    path('objectifs-superieur/<int:pk>/valider/', ValiderObjectifAPIView.as_view(), name='valider-objectif'),
    path('objectifs-superieur/<int:pk>/rejeter/', RejeterObjectifAPIView.as_view(), name='rejeter-objectif'),
    path( 'objectifs-superieur/<int:pk>/modifier/', ObjectifModifierForSuperior.as_view(), name='objectif-modifier-superieur'),


    path('objectifs/<int:pk>/modifier/', modifier_objectif, name='modifier_objectif'),
    #path('objectifs-superieur/<int:pk>/', ObjectifSuperieurDetail.as_view(), name='objectifs_superieur_detail'),
path('objectifs-sous-responsable/', ObjectifsSousResponsableAPIView.as_view(), name='objectifs-sous-responsable'),
path('realisations/<int:pk>/valider/', ValiderRealisationView.as_view(), name='valider_realisation'),
    path('realisations/<int:pk>/rejeter/', RejeterRealisationView.as_view(), name='rejeter_realisation'),
    path('realisations/<int:pk>/modifier/', ModifierRealisationView.as_view(), name='modifier_realisation'),

]