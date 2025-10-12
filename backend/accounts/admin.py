from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from performance.models import Periode, Service, Objectif, Realisation
from .models import Agent



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
    list_display = ('id', 'libelle', 'type_kpi', 'cible', 'poids', 'annee', 'service', 'agent', 'periode', 'est_valide', 'est_rejete')
    list_filter = ('type_kpi', 'annee', 'est_valide', 'est_rejete', 'service')
    search_fields = ('libelle', 'cible', 'service__nom_service', 'agent__nom')
    ordering = ('annee', 'type_kpi')

@admin.register(Realisation)
class RealisationAdmin(admin.ModelAdmin):
    list_display = ('id', 'objectif', 'agent', 'taux_avancement', 'est_valide', 'est_rejete', 'date_soumission', 'date_validation')
    list_filter = ('est_valide', 'est_rejete', 'date_soumission')
    search_fields = ('objectif__libelle', 'agent__nom', 'agent__prenom')
    ordering = ('-date_soumission',)
    readonly_fields = ('date_soumission', 'date_validation')

