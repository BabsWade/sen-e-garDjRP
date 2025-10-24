from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PeriodeViewSet, ServiceViewSet, ObjectifViewSet, PerformanceAPIView, IndicateurViewSet, \
    AgentDashboardView, PlanStrategiqueViewSet, ObjectifProgrammeViewSet

router = DefaultRouter()
router.register(r'periodes', PeriodeViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'objectifs', ObjectifViewSet, basename='objectif')
router.register(r'indicateurs', IndicateurViewSet)
router.register(r'agent-objectifs', ObjectifViewSet, basename='agent-objectifs')
router.register('planstrategique', PlanStrategiqueViewSet, basename='planstrategique')
router.register('objectifprogramme', ObjectifProgrammeViewSet, basename='objectifprogramme')
urlpatterns = [
    path('', include(router.urls)),
    path('performance-agent/', PerformanceAPIView.as_view(), name='performance'),
    # path('performance-agent/', PerformanceAgentAPIView.as_view(), name='performance-agent')
    path('dashboard-agent/', AgentDashboardView.as_view(), name='dashboard-agent'),

]