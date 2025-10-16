"""from rest_framework import permissions

class ObjectifAccessPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.role == 'DRH':
            return True  # DRH peut tout voir

        if user.role == 'AGENT':
            return obj.agent == user  # Peut voir/modifier seulement ses objectifs

        if user.role == 'RESPONSABLE_N1':
            # Vérifie si l’agent est sous sa supervision
            return obj.agent.responsable_matricule == user.matricule

        return False
"""