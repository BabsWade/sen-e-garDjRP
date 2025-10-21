from django.db import models

# Create your models here.
# models.py

from django.contrib.auth.models import User

from accounts.models import Agent


from django.conf import settings  # Importer settings pour accéder à AUTH_USER_MODEL



class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Création'),
        ('UPDATE', 'Mise à jour'),
        ('DELETE', 'Suppression'),
    ]

    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)  # Le modèle affecté (ex : "Objectif", "Agent")
    object_id = models.PositiveIntegerField()  # ID de l'objet affecté
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)  # L'utilisateur qui a effectué l'action
    timestamp = models.DateTimeField(auto_now_add=True)  # Heure de l'action
    description = models.TextField()  # Description de l'action (par exemple, "mise à jour de la note de performance")

    def __str__(self):
        return f"{self.action} sur {self.model_name} par {self.user} à {self.timestamp}"

    class Meta:
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"


class UserRole(models.Model):
    ROLE_CHOICES = [
        ('AGENT', 'Agent Public'),
        ('RESPONSABLE_N1', 'Responsable Hiérarchique'),
        ('DRH', 'Direction RH'),
        ('ADMIN', 'Administrateur Technique'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # Lien avec l'utilisateur
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)  # Rôle de l'utilisateur
    permissions = models.JSONField(default=list)  # Permissions spécifiques (par exemple, accès aux rapports)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class Report(models.Model):
    report_type = models.CharField(max_length=100)  # Type de rapport (ex : "Répartition des notes", "Taux d'atteinte par Service")
    generated_by = models.CharField(max_length=100)  # Utilisateur ou système ayant généré le rapport
    generated_at = models.DateTimeField(auto_now_add=True)  # Date et heure de la génération du rapport
    report_data = models.JSONField()  # Données du rapport (peut contenir des tableaux ou autres informations)
    file_format = models.CharField(max_length=10, choices=[('CSV', 'CSV'), ('XLSX', 'XLSX')])  # Format du fichier généré

    def __str__(self):
        return f"Rapport {self.report_type} généré à {self.generated_at}"

    class Meta:
        verbose_name = "Rapport"
        verbose_name_plural = "Rapports"

class ExportedData(models.Model):
    data_type = models.CharField(max_length=100)  # Type de données exportées (ex : "Évaluations", "Performances")
    exported_by = models.CharField(max_length=100)  # Utilisateur ou système ayant exporté les données
    export_date = models.DateTimeField(auto_now_add=True)  # Date de l'exportation
    file_url = models.URLField()  # URL du fichier exporté
    file_format = models.CharField(max_length=10, choices=[('CSV', 'CSV'), ('XLSX', 'XLSX')])  # Format du fichier exporté

    def __str__(self):
        return f"Exportation de {self.data_type} à {self.export_date}"

    class Meta:
        verbose_name = "Données Exportées"
        verbose_name_plural = "Données Exportées"