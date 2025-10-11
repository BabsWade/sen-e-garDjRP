from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
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
