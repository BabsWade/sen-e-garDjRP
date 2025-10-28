from rest_framework import permissions
from accounts.models import Agent

from rest_framework import permissions

class ObjectifAccessPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user

        # DRH : accès complet
        if user.role == 'DRH':
            return True

        # Superieur hiérarchique : accès aux objectifs de ses subordonnés
        if user.role == 'RESPONSABLE_N1' or getattr(user, 'superieur_hierarchique', False):
            return obj.agent.responsable.user == user or obj.agent.user == user

        # Agent simple : uniquement ses propres objectifs
        if user.role == 'AGENT':
            return obj.agent.user == user

        return False

