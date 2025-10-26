from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from planification_alignement.models import Service, Objectif  # Assurez-vous que le modèle Service est correctement importé
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
        Calcule la performance pondérée et le taux de réalisations validées.
        Crée un nouvel historique si variation >= seuil sur l'une des deux valeurs.
        """
        from decimal import Decimal
        from planification_alignement.models import Objectif
        from suivi_execution.models import Realisation

        #objectifs = self.objectif_set.filter(statut='valide')
        objectifs = self.objectifs_planification.filter(statut='valide')

        if not objectifs.exists():
            perf = 0
            taux_realisations = 0
        else:
            # --- Calcul de la performance pondérée
            numerator = 0.0
            denom = 0.0
            total_cible = 0
            total_realise = 0

            for obj in objectifs:
                taux = float(obj.taux_avancement)
                poids = float(obj.poids)
                numerator += taux * poids
                denom += poids

                # --- Calcul du taux de réalisations validées
                realisations_valides = Realisation.objects.filter(objectif=obj, est_valide=True).count()
                total_realise += realisations_valides
                total_cible += getattr(obj, 'cible', 0) or 0

            perf = numerator / denom if denom > 0 else 0.0
            taux_realisations = round((total_realise / total_cible) * 100, 2) if total_cible else 0

        dernier = self.historique_performances.order_by('-date_calcul').first()

        if not dernier:
            HistoriquePerformance.objects.create(
                agent=self,
                performance=perf,
                taux_realisations_valides=taux_realisations
            )
        else:
            var_perf = abs(perf - float(dernier.performance))
            var_taux = abs(taux_realisations - float(dernier.taux_realisations_valides))
            if var_perf >= seuil_variation or var_taux >= seuil_variation:
                HistoriquePerformance.objects.create(
                    agent=self,
                    performance=perf,
                    taux_realisations_valides=taux_realisations
                )

        self.performance_moyenne = round(perf, 2)
        self.save(update_fields=['performance_moyenne'])
        return self.performance_moyenne

    def ajouter_evaluation_comportementale(self, evaluation):
        self.evaluation_comportementale = evaluation
        self.save()

    def taux_realisations_valides(self):
        """
        Retourne le pourcentage de réalisations validées de l'agent
        par rapport à la somme des cibles de tous ses objectifs.
        """
        # Récupère tous les objectifs de l'agent
        objectifs = self.objectifs_planification.all()  # lié via related_name='objectifs_planification'
        if not objectifs.exists():
            return 0.0

        # Somme des cibles
        total_cibles = sum(obj.cible for obj in objectifs if obj.cible)

        if total_cibles == 0:
            return 0.0

        # Somme des réalisations validées
        total_realisations_validees = sum(
            obj.realisations.filter(est_valide=True).count()
            for obj in objectifs
        )

        # Calcul du pourcentage
        taux = (total_realisations_validees / total_cibles) * 100
        return round(taux, 2)

class HistoriquePerformance(models.Model):
    agent = models.ForeignKey('Agent', on_delete=models.CASCADE, related_name='historique_performances')
    performance = models.DecimalField(max_digits=5, decimal_places=2)
    taux_realisations_valides = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # ✅ Ajouté ici

    date_calcul = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-date_calcul']  # plus récent en premier

    def __str__(self):
        return f"Performance de {self.agent} : {self.performance}% le {self.date_calcul.strftime('%Y-%m-%d %H:%M')}"