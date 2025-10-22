from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from planification_alignement.models import Service  # Assurez-vous que le modèle Service est correctement importé
from django.utils import timezone

ROLES = (
    ('AGENT', 'Agent Public'),
    ('RESPONSABLE_N1', 'Responsable Hiérarchique'),
    ('DRH', 'Direction RH'),
    ('ADMIN', 'Administrateur Technique'),
)


class AgentManager(BaseUserManager):
    def create_user(self, matricule, email, nom, prenom, password=None, **extra_fields):
        if not email:
            raise ValueError("L'email est obligatoire")
        if not matricule:
            raise ValueError("Le matricule est obligatoire")

        email = self.normalize_email(email)
        user = self.model(matricule=matricule, email=email, nom=nom, prenom=prenom, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, matricule, email, nom, prenom, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(matricule, email, nom, prenom, password, **extra_fields)


class Agent(AbstractBaseUser, PermissionsMixin):
    matricule = models.CharField(max_length=20, unique=True)
    nom = models.CharField(max_length=50)
    prenom = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLES)
    date_embauche = models.DateField(null=True, blank=True)

    service = models.ForeignKey(Service, on_delete=models.CASCADE, null=True, blank=True)
    responsable = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordonnes'
    )

    #objectifs = models.ManyToManyField('planification_alignement.Objectif', blank=True, related_name='agents')
    #superieur = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, related_name='subordonnes')

    performance_moyenne = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    evaluation_comportementale = models.TextField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Nouveaux champs ajoutés
    etat_agent = models.CharField(max_length=20, choices=[('Actif', 'Actif'), ('Inactif', 'Inactif'), ('En pause', 'En pause')], default='Actif')

    USERNAME_FIELD = 'matricule'
    REQUIRED_FIELDS = ['email', 'nom', 'prenom']

    objects = AgentManager()

    def __str__(self):
        return f"{self.matricule} - {self.nom} {self.prenom}"

    def get_full_name(self):
        return f"{self.nom} {self.prenom}"

    def get_short_name(self):
        return self.prenom

    def calculer_performance_ponderee(self, seuil_variation=1.0):
        """
        Calcule la performance pondérée de l'agent.
        Enregistre un nouvel HistoriquePerformance uniquement si la variation
        dépasse ±seuil_variation (%).
        """
        from decimal import Decimal

        objectifs = self.objectif_set.filter(est_valide=True)

        if not objectifs.exists():
            self.performance_moyenne = 0
            self.save(update_fields=['performance_moyenne'])
            if not self.historique_performances.exists():
                HistoriquePerformance.objects.create(agent=self, performance=0)
            return self.performance_moyenne

        numerator = 0.0
        denom = 0.0
        for obj in objectifs:
            taux = float(obj.taux_avancement)
            poids = float(obj.poids)
            numerator += taux * poids
            denom += poids

        performance = numerator / denom if denom > 0 else 0.0

        dernier_historique = self.historique_performances.order_by('-date_calcul').first()

        if not dernier_historique:
            HistoriquePerformance.objects.create(agent=self, performance=performance)
        else:
            ancienne_perf = float(dernier_historique.performance)
            variation = abs(performance - ancienne_perf)

            if variation >= seuil_variation:
                HistoriquePerformance.objects.create(agent=self, performance=performance)

        self.performance_moyenne = round(performance, 2)
        self.save(update_fields=['performance_moyenne'])

        return self.performance_moyenne

    def ajouter_evaluation_comportementale(self, evaluation):
        self.evaluation_comportementale = evaluation
        self.save()


class HistoriquePerformance(models.Model):
    agent = models.ForeignKey('Agent', on_delete=models.CASCADE, related_name='historique_performances')
    performance = models.DecimalField(max_digits=5, decimal_places=2)
    date_calcul = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-date_calcul']  # plus récent en premier

    def __str__(self):
        return f"Performance de {self.agent} : {self.performance}% le {self.date_calcul.strftime('%Y-%m-%d %H:%M')}"