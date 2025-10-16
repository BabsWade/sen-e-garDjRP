from django.apps import AppConfig


class SuiviExecutionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'suivi_execution'

    def ready(self):
        import suivi_execution.signals  # pour que les signaux soient enregistrés