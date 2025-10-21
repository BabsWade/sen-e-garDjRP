from rest_framework import permissions
from accounts.models import Agent

class ObjectifAccessPermission(permissions.BasePermission):
    """
    Restriction des accès aux objectifs :
    - Agent : accès à ses propres objectifs
    - N+1 : accès aux objectifs des subordonnés
    - DRH : accès complet
    """

    def has_permission(self, request, view):
        # L'utilisateur doit être authentifié
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Récupérer l'Agent lié à l'utilisateur
        try:
            user_agent = Agent.objects.get(user=user)
        except Agent.DoesNotExist:
            return False  # L'utilisateur n'a pas de profil Agent associé

        # DRH peut tout voir
        if user_agent.role == 'DRH':
            return True

        # Agent peut voir seulement ses propres objectifs
        if user_agent.role == 'AGENT':
            return obj.agent == user_agent

        # Responsable N+1 peut voir les objectifs de ses subordonnés
        if user_agent.role == 'RESPONSABLE_N1':
            return obj.agent.responsable == user_agent

        # Tout autre rôle n'a pas accès
        return False
