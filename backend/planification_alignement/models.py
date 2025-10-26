from django.db import models

class Indicateur(models.Model):
    code = models.CharField(max_length=50, unique=True)
    libelle = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    TYPE_KPI_CHOICES = [
        ('Quantitatif', 'Quantitatif'),
        ('Qualitatif', 'Qualitatif'),
        ('Délai', 'Délai'),
    ]
    type_kpi = models.CharField(max_length=30, choices=TYPE_KPI_CHOICES)
    cible = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.code} — {self.libelle}"


class Periode(models.Model):
    libelle_periode = models.CharField(max_length=100)
    date_debut = models.DateField()
    date_fin = models.DateField()
    est_active = models.BooleanField(default=False)  # ✅ ajoute ceci

    def __str__(self):
        return self.libelle_periode



class Service(models.Model):
    nom_service = models.CharField(max_length=100, unique=True)
    code_programme_budgetaire = models.CharField(max_length=15, unique=True)

    def get_agents(self):
        from accounts.models import Agent
        return Agent.objects.filter(service=self)

    def __str__(self):
        return self.nom_service


class Objectif(models.Model):
    # ton choix d’anciennes champs ici...
    TYPE_KPI_CHOICES = [
        ('Quantitatif', 'Quantitatif'),
        ('Qualitatif', 'Qualitatif'),
        ('Délai', 'Délai'),
    ]

    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('valide', 'Validé'),
        ('rejete', 'Rejeté'),
    ]

    libelle = models.TextField()
    # tu peux retirer type_kpi si tu veux le tirer de l’indicateur
    type_kpi = models.CharField(max_length=30, choices=TYPE_KPI_CHOICES, blank=True, null=True)
    cible = models.FloatField(max_length=100, blank=True, null=True)
    poids = models.DecimalField(max_digits=5, decimal_places=2)
    annee = models.IntegerField(blank=True, null=True)
    date_debut = models.DateField(null=True, blank=True)
    date_delai = models.DateField(null=True, blank=True)

    type_objectif = models.CharField(max_length=30, choices=[('Individuel','Individuel'), ('Collectif','Collectif')], default='Individuel')
    #taux_avancement = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # nouveau champ

    service = models.ForeignKey(Service, on_delete=models.CASCADE, blank=True, null=True)
    #agent = models.ForeignKey('accounts.Agent', on_delete=models.SET_NULL, null=True, blank=True)
    agent = models.ForeignKey(
        'accounts.Agent',
        on_delete=models.CASCADE,
        related_name='objectifs_planification',  # ✅ Important
        null=True, blank=True
    )

    periode = models.ForeignKey(Periode, on_delete=models.CASCADE)
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente'
    )
    #est_valide = models.BooleanField(default=False)
    #est_rejete = models.BooleanField(default=False)
    commentaire_rejet = models.TextField(blank=True, null=True)
    date_validation = models.DateTimeField(null=True, blank=True)
    competences_comportementales = models.TextField(blank=True, null=True)
    taux_avancement = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    performance_moyenne = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    indicateur = models.ForeignKey(
        Indicateur,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='objectifs'
    )
    # 🔹 Lien avec les niveaux supérieurs
    objectif_programme = models.ForeignKey(
        'ObjectifProgramme',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='objectifs_agents'
    )

    plan_strategique = models.ForeignKey(
        'PlanStrategique',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

class PlanStrategique(models.Model):
    titre = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    date_debut = models.DateField(blank=True, null=True)
    date_fin = models.DateField(blank=True, null=True)
    vision = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.titre} ({self.date_debut}-{self.date_fin})"

class ObjectifProgramme(models.Model):
    plan_strategique = models.ForeignKey(
    PlanStrategique,
        on_delete=models.CASCADE,
        related_name='objectifs_programmes'
    )
    intitule = models.TextField()
    resultat_attendu = models.TextField(blank=True, null=True)
    indicateur = models.ForeignKey('Indicateur', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.intitule[:50]}..."

    @property
    def taux_avancement_total(self):
        realisations = self.realisations.filter(est_valide=True)

        if not realisations.exists():
            return 0
        total = sum(r.taux_avancement for r in realisations)
        return total / realisations.count()

    def __str__(self):
        return f"{self.libelle[:40]}..."