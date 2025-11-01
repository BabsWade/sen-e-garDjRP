from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
#from performance.models import Periode, Service, Objectif, Realisation
from .models import Agent, HistoriquePerformance
from planification_alignement.models import Periode, Service, Objectif
from suivi_execution.models import Realisation

from evaluation.models import Evaluation, NoteFinale, Contestation, AutoEvaluation

from reporting.models import AuditLog, UserRole, ExportedData, Report

from planification_alignement.models import Indicateur

from planification_alignement.models import PlanStrategique, ObjectifProgramme

from suivi_execution.models import Notification

from evaluation.models import HistoriqueEvaluation


# accounts/admin.py

@admin.register(Agent)
class AgentAdmin(UserAdmin):
    list_display = (
        'matricule', 'email', 'nom', 'prenom', 'role', 'superieur_hierarchique',
        'poste', 'type_contrat', 'statut', 'is_active', 'is_staff'
    )
    list_filter = ('role', 'is_active', 'is_staff', 'statut', 'type_contrat')
    search_fields = ('matricule', 'email', 'nom', 'prenom', 'poste')

    fieldsets = (
        (None, {'fields': ('matricule', 'email', 'password')}),
        ('Infos personnelles', {
            'fields': (
                'nom', 'prenom', 'sexe', 'date_naissance', 'lieu_naissance',
                'nationalite', 'photo', 'adresse', 'ville', 'pays',
                'telephone', 'email_personnel'
            )
        }),
        ('Organisation', {
            'fields': (
                'service', 'responsable', 'poste', 'type_contrat',
                'statut', 'date_embauche', 'date_fin_contrat', 'lieu_travail'
            )
        }),
        ('Formation & Compétences', {
            'fields': (
                'niveau_etude', 'diplomes', 'competences',
                'langues', 'certifications'
            )
        }),
        ('Rôle et permissions', {
            'fields': (
                'role', 'superieur_hierarchique', 'is_active', 'is_staff', 'is_superuser',
                'groups', 'user_permissions'
            )
        }),
        ('Dates importantes', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'matricule', 'email', 'nom', 'prenom', 'password1', 'password2',
                'role', 'poste', 'type_contrat', 'statut',
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
    list_display = (
        'id', 'libelle', 'type_kpi', 'cible', 'poids', 'annee',
        'date_delai', 'date_debut', 'service', 'agent', 'periode',
        'taux_avancement', 'statut'
    )
    list_filter = ('type_kpi', 'annee', 'statut', 'service')
    search_fields = ('libelle', 'cible', 'service__nom_service', 'agent__nom')
    ordering = ('annee', 'type_kpi')
    readonly_fields = ('annee',)
    exclude = ('taux_avancement',)  # Empêche la modification manuelle

    def get_fields(self, request, obj=None):
        """
        Affiche 'commentaire_rejet' uniquement si le statut est 'rejete'
        """
        fields = [
            'libelle', 'type_kpi', 'cible', 'poids', 'annee',
            'date_debut', 'date_delai', 'type_objectif',
            'service', 'agent', 'periode', 'statut',
            'date_validation', 'competences_comportementales',
            'performance_moyenne', 'indicateur', 'objectif_programme',
            'plan_strategique'
        ]

        # Si l’objectif est rejeté, on affiche le champ commentaire_rejet
        if obj and obj.statut == 'rejete':
            fields.append('commentaire_rejet')

        return fields

    def save_model(self, request, obj, form, change):
        """
        Met à jour automatiquement l'année à partir de la période
        """
        if obj.periode:
            obj.annee = obj.periode.date_debut.year
        super().save_model(request, obj, form, change)

    class Media:
        js = ('admin/js/objectif_admin.js',)


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
    list_display = ('agent', 'note_finale', 'commentaire', 'date_evaluation')
    list_filter = ('date_evaluation',)
    search_fields = ('agent__nom',)
    ordering = ('-date_evaluation',)

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

@admin.register(PlanStrategique)
class PlanStrategiqueAdmin(admin.ModelAdmin):
    list_display = ('titre', 'description', 'date_debut', 'date_fin', 'vision')

@admin.register(ObjectifProgramme)
class ObjectifProgrammeAdmin(admin.ModelAdmin):
    list_display = ('intitule', 'resultat_attendu', 'plan_strategique', 'indicateur' )

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'agent', 'message', 'statut', 'date_envoi', 'lue_le')
    list_filter = ('statut', 'date_envoi')
    search_fields = ('agent__nom', 'agent__prenom', 'message')
    readonly_fields = ('date_envoi', 'lue_le')
    ordering = ('-date_envoi',)

@admin.register(HistoriqueEvaluation)
class HistoriqueEvaluationAdmin(admin.ModelAdmin):
    list_display = ('agent', 'periode', 'performance_ponderee', 'date_archivage')
    list_filter = ('periode',)
    search_fields = ('agent__matricule', 'agent__nom', 'agent__prenom')
    ordering = ('-date_archivage',)

from django.contrib import admin
from .models import HistoriqueTauxRealisations

@admin.register(HistoriqueTauxRealisations)
class HistoriqueTauxRealisationsAdmin(admin.ModelAdmin):
    list_display = ('agent', 'taux_realisations_valides', 'date_calcul')
    list_filter = ('agent',)
    ordering = ('-date_calcul',)

