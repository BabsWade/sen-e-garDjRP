from django.urls import path
from .views import (
    AgentRegisterView,
    CurrentUserView,
    ActivateAccountView,
    SetPasswordView,
)

urlpatterns = [
    path('register/', AgentRegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('activate/<uidb64>/<token>/', ActivateAccountView.as_view(), name='activate'),

    path('set-password/', SetPasswordView.as_view(), name='set_password'),
]
