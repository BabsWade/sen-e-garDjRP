"""from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


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
        from accounts.models import Agent  # Import à la demande
        return Agent.objects.filter(service=self)

    def __str__(self):
        return self.nom_service


class Objectif(models.Model):
    TYPE_KPI_CHOICES = [
        ('Quantitatif', 'Quantitatif'),
        ('Qualitatif', 'Qualitatif'),
        ('Délai', 'Délai'),
    ]

    @property
    def taux_avancement_total(self):
        realisations = self.realisations.all()
        if not realisations.exists():
            return 0
        return sum(r.taux_avancement for r in realisations) // realisations.count()

    libelle = models.TextField()
    type_kpi = models.CharField(max_length=30, choices=TYPE_KPI_CHOICES)
    cible = models.CharField(max_length=100)
    poids = models.DecimalField(max_digits=5, decimal_places=2)
    annee = models.IntegerField()

    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    agent = models.ForeignKey('accounts.Agent', on_delete=models.SET_NULL, null=True, blank=True)  # Utilisation du nom en chaîne
    periode = models.ForeignKey(Periode, on_delete=models.CASCADE)
    est_valide = models.BooleanField(default=False)  # validé par le N+1
    est_rejete = models.BooleanField(default=False)
    commentaire_rejet = models.TextField(blank=True, null=True)
    date_validation = models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return f"{self.libelle[:40]}..."
class Realisation(models.Model):
    objectif = models.ForeignKey(Objectif, on_delete=models.CASCADE, related_name="realisations")
    agent = models.ForeignKey('accounts.Agent', on_delete=models.SET_NULL, null=True, blank=True)  # Utilisation du nom en chaîne
    description = models.TextField()
    taux_avancement = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    preuve = models.FileField(upload_to='preuves/', null=True, blank=True)
    est_valide = models.BooleanField(default=False)
    est_rejete = models.BooleanField(default=False)
    commentaire_rejet = models.TextField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)  # Feedback du N+1
    date_soumission = models.DateTimeField(auto_now_add=True)
    date_validation = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-date_soumission']

    def __str__(self):
        return f"Réalisation de {self.agent} pour {self.objectif}"""""