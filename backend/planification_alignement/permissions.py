from rest_framework import permissions

from planification_alignement.models import Objectif

class ObjectifAccessPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user

        # DRH : accès complet
        if user.role == 'DRH':
            return True

        # Superieur hiérarchique ou RESPONSABLE_N1 : accès aux objectifs de ses subordonnés et ses propres objectifs
        if user.role == 'RESPONSABLE_N1' or getattr(user, 'superieur_hierarchique', False):
            # Accès si l'objectif appartient à l'agent supervisé ou à soi-même
            return obj.agent == user or (hasattr(obj.agent, 'responsable') and obj.agent.responsable == user)

        # Agent simple : uniquement ses propres objectifs
        if user.role == 'AGENT':
            return obj.agent == user

        return False