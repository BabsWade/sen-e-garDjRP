from django.db import models
from accounts.models import Agent  # Import de ton modèle Agent


class Periode(models.Model):
    libelle_periode = models.CharField(max_length=50, unique=True)
    date_debut = models.DateField()
    date_fin = models.DateField()

    def __str__(self):
        return self.libelle_periode


class Service(models.Model):
    nom_service = models.CharField(max_length=100, unique=True)
    code_programme_budgetaire = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return self.nom_service


class Objectif(models.Model):
    TYPE_KPI_CHOICES = [
        ('Quantitatif', 'Quantitatif'),
        ('Qualitatif', 'Qualitatif'),
        ('Délai', 'Délai'),
    ]

    libelle = models.TextField()
    type_kpi = models.CharField(max_length=30, choices=TYPE_KPI_CHOICES)
    cible = models.CharField(max_length=100)
    poids = models.DecimalField(max_digits=5, decimal_places=2)
    annee = models.IntegerField()

    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE)
    periode = models.ForeignKey(Periode, on_delete=models.CASCADE)
    est_valide = models.BooleanField(default=False)  # validé par le N+1
    est_rejete = models.BooleanField(default=False)
    commentaire_rejet = models.TextField(blank=True, null=True)
    date_validation = models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return f"{self.libelle[:40]}..."
