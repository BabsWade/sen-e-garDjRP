# suivi_execution/apps.py

from django.apps import AppConfig

class SuiviExecutionConfig(AppConfig):
    name = 'suivi_execution'

    def ready(self):
        import suivi_execution.signals  # pour que les handlers soient enregistrés
