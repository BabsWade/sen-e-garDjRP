from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
#from performance.models import Periode, Service, Objectif, Realisation
from .models import Agent, HistoriquePerformance
from planification_alignement.models import Periode, Service, Objectif
from suivi_execution.models import Realisation

from evaluation.models import Evaluation, NoteFinale, Contestation, AutoEvaluation

from reporting.models import AuditLog, UserRole, ExportedData, Report

from planification_alignement.models import Indicateur


# accounts/admin.py

@admin.register(Agent)
class AgentAdmin(UserAdmin):
    list_display = ('matricule', 'email', 'nom', 'prenom', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('matricule', 'email', 'nom', 'prenom')

    fieldsets = (
        (None, {'fields': ('matricule', 'email', 'password')}),
        ('Infos personnelles', {'fields': ('nom', 'prenom')}),
        ('Rôle et permissions', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Organisation', {'fields': ('service', 'responsable')}),
        ('Dates importantes', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'matricule', 'email', 'nom', 'prenom', 'password1', 'password2', 'role',
                'is_staff', 'is_active', 'service', 'responsable'
            )
        }),
    )

    ordering = ('matricule',)
    readonly_fields = ('last_login',)
@admin.register(Periode)
class PeriodeAdmin(admin.ModelAdmin):
    list_display = ('id', 'libelle_periode', 'date_debut', 'date_fin')
    list_filter = ('date_debut', 'date_fin')
    search_fields = ('libelle_periode',)
    ordering = ('date_debut',)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom_service', 'code_programme_budgetaire')
    search_fields = ('nom_service', 'code_programme_budgetaire')
    ordering = ('nom_service',)

@admin.register(Objectif)
class ObjectifAdmin(admin.ModelAdmin):
    list_display = ('id', 'libelle', 'type_kpi', 'cible', 'poids', 'annee', 'service', 'agent', 'periode', 'taux_avancement', 'est_valide', 'est_rejete')
    list_filter = ('type_kpi', 'annee', 'est_valide', 'est_rejete', 'service')
    search_fields = ('libelle', 'cible', 'service__nom_service', 'agent__nom')
    ordering = ('annee', 'type_kpi')
    readonly_fields = ('annee',)
    exclude = ('taux_avancement',)  # Empêche la modification manuelle

    def save_model(self, request, obj, form, change):
        # Si c’est une création (change = False) ou si l’annee n’est pas renseignée
        if obj.periode:
            obj.annee = obj.periode.date_debut.year
        super().save_model(request, obj, form, change)
@admin.register(Realisation)
class RealisationAdmin(admin.ModelAdmin):
    list_display = ('id', 'objectif', 'agent', 'est_valide', 'est_rejete', 'date_soumission', 'date_validation')
    list_filter = ('est_valide', 'est_rejete', 'date_soumission')
    search_fields = ('objectif__libelle', 'agent__nom', 'agent__prenom')
    ordering = ('-date_soumission',)
    readonly_fields = ('date_soumission', 'date_validation')

@admin.register(AutoEvaluation)
class AutoEvaluationAdmin(admin.ModelAdmin):
    list_display = ('agent', 'objectif', 'note', 'commentaire')
    list_filter = ('agent', 'objectif')
    search_fields = ('agent__nom', 'objectif__libelle')
    ordering = ('agent',)

@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('agent', 'responsable', 'objectif', 'note', 'est_valide')
    list_filter = ('responsable', 'est_valide')
    search_fields = ('agent__nom', 'objectif__libelle')
    ordering = ('responsable',)

@admin.register(NoteFinale)
class NoteFinaleAdmin(admin.ModelAdmin):
    list_display = ('agent', 'note_finale', 'commentaire', 'date_valuation')
    list_filter = ('date_valuation',)
    search_fields = ('agent__nom',)
    ordering = ('-date_valuation',)

@admin.register(Contestation)
class ContestationAdmin(admin.ModelAdmin):
    list_display = ('agent', 'evaluation', 'commentaire', 'date_contestation')
    list_filter = ('date_contestation',)
    search_fields = ('agent__nom', 'evaluation__id')
    ordering = ('-date_contestation',)

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'model_name', 'object_id', 'user', 'timestamp', 'description')
    search_fields = ('action', 'model_name', 'description')
    list_filter = ('action', 'model_name', 'timestamp')

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'permissions')
    search_fields = ('user__username', 'role')
    list_filter = ('role',)

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('report_type', 'generated_by', 'generated_at', 'file_format')
    search_fields = ('report_type', 'generated_by')
    list_filter = ('report_type', 'generated_at')

@admin.register(ExportedData)
class ExportedDataAdmin(admin.ModelAdmin):
    list_display = ('data_type', 'exported_by', 'export_date', 'file_format')
    search_fields = ('data_type', 'exported_by')
    list_filter = ('data_type', 'export_date', 'file_format')

@admin.register(Indicateur)
class IndicateurAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'libelle', 'type_kpi', 'cible')
    search_fields = ('code', 'libelle')
    ordering = ('code',)

@admin.register(HistoriquePerformance)
class HistoriquePerformanceAdmin(admin.ModelAdmin):
    list_display = ('agent', 'performance', 'date_calcul')
    list_filter = ('agent',)
    search_fields = ('agent__matricule', 'agent__nom', 'agent__prenom')
    ordering = ('-date_calcul',)