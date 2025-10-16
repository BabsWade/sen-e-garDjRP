# planification_alignement/models.py
from django.db import models


class Periode(models.Model):
    libelle_periode = models.CharField(max_length=50, unique=True)
    date_debut = models.DateField()
    date_fin = models.DateField()

    def __str__(self):
        return self.libelle_periode

class Service(models.Model):
    nom_service = models.CharField(max_length=100, unique=True)
    code_programme_budgetaire = models.CharField(max_length=15, unique=True)

    def get_agents(self):
        # Déplacer l'importation à l'intérieur de la méthode pour éviter l'import circulaire
        from accounts.models import Agent
        return Agent.objects.filter(service=self)

    def __str__(self):
        return self.nom_service



class Objectif(models.Model):
    TYPE_KPI_CHOICES = [
        ('Quantitatif', 'Quantitatif'),
        ('Qualitatif', 'Qualitatif'),
        ('Délai', 'Délai'),
    ]

    TYPE_OBJECTIF_CHOICES = [
        ('Individuel', 'Individuel'),
        ('Collectif', 'Collectif'),
    ]

    libelle = models.TextField()
    type_kpi = models.CharField(max_length=30, choices=TYPE_KPI_CHOICES)
    cible = models.CharField(max_length=100)
    poids = models.DecimalField(max_digits=5, decimal_places=2)
    annee = models.IntegerField()  # Ce champ sera rempli automatiquement
    type_objectif = models.CharField(max_length=30, choices=TYPE_OBJECTIF_CHOICES, default='Individuel')

    service = models.ForeignKey('Service', on_delete=models.CASCADE)
    agent = models.ForeignKey('accounts.Agent', on_delete=models.SET_NULL, null=True, blank=True)
    periode = models.ForeignKey('Periode', on_delete=models.CASCADE)

    est_valide = models.BooleanField(default=False)  # validé par le N+1
    est_rejete = models.BooleanField(default=False)
    commentaire_rejet = models.TextField(blank=True, null=True)
    date_validation = models.DateTimeField(null=True, blank=True)

    competences_comportementales = models.TextField(blank=True, null=True)

    @property
    def taux_avancement_total(self):
        realisations = self.realisations.all()
        if not realisations.exists():
            return 0
        return sum(r.taux_avancement for r in realisations) // realisations.count()

    def save(self, *args, **kwargs):
        if self.periode:
            self.annee = self.periode.date_debut.year
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.libelle[:40]}..."
