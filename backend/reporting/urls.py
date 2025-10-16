# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet, UserRoleViewSet, ReportViewSet, ExportedDataViewSet
from . import views

router = DefaultRouter()
router.register(r'auditlogs', AuditLogViewSet, basename='auditlog')
router.register(r'roles', UserRoleViewSet, basename='role')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'exporteddata', ExportedDataViewSet, basename='exporteddata')

urlpatterns = [
    path('export_report/', views.export_report, name='export_report'),
    path('api/', include(router.urls)),  # L'API est accessible sous /api/
]
