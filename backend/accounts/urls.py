from django.urls import path
from .views import AgentRegisterView, CurrentUserView

urlpatterns = [
    path('register/', AgentRegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current_user'),

]
