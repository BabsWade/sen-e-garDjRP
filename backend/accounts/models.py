from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from planification_alignement.models import Service, Objectif  # Assurez-vous que le modèle Service est correctement importé
from django.utils import timezone
from planification_alignement.models import Periode

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
    ROLE_CHOICES = [
        ('AGENT', 'Agent'),
        ('RESPONSABLE_N1', 'Responsable N+1'),
        ('DRH', 'DRH'),
    ]
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
    superieur_hierarchique = models.BooleanField(default=False)

    performance_moyenne = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    evaluation_comportementale = models.TextField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    etat_agent = models.CharField(
        max_length=20,
        choices=[('Actif', 'Actif'), ('Inactif', 'Inactif'), ('En pause', 'En pause')],
        default='Actif'
    )

    # --- Nouveaux champs facultatifs ---
    SEXE_CHOICES = [('H', 'Homme'), ('F', 'Femme')]
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES, null=True, blank=True)
    date_naissance = models.DateField(null=True, blank=True)
    lieu_naissance = models.CharField(max_length=100, null=True, blank=True)
    nationalite = models.CharField(max_length=50, null=True, blank=True)
    photo = models.ImageField(upload_to='photos_agents/', null=True, blank=True)
    adresse = models.CharField(max_length=255, null=True, blank=True)
    ville = models.CharField(max_length=50, null=True, blank=True)
    pays = models.CharField(max_length=50, null=True, blank=True)
    telephone = models.CharField(max_length=20, null=True, blank=True)
    email_personnel = models.EmailField(null=True, blank=True)
    poste = models.CharField(max_length=100, null=True, blank=True)
    type_contrat = models.CharField(max_length=50, null=True, blank=True)
    STATUT_CHOICES = [('Cadre', 'Cadre'), ('Non Cadre', 'Non Cadre')]
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, null=True, blank=True)
    date_fin_contrat = models.DateField(null=True, blank=True)
    lieu_travail = models.CharField(max_length=100, null=True, blank=True)
    niveau_etude = models.CharField(max_length=100, null=True, blank=True)
    diplomes = models.TextField(null=True, blank=True)
    competences = models.TextField(null=True, blank=True)
    langues = models.TextField(null=True, blank=True)
    certifications = models.TextField(null=True, blank=True)

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
        from decimal import Decimal
        from planification_alignement.models import Objectif
        from suivi_execution.models import Realisation

        objectifs = self.objectifs_planification.filter(statut='valide')

        if not objectifs.exists():
            perf = 0
            taux_realisations = 0
        else:
            numerator = 0.0
            denom = 0.0
            total_cible = 0
            total_realise = 0

            for obj in objectifs:
                taux = float(obj.taux_avancement)
                poids = float(obj.poids)
                numerator += taux * poids
                denom += poids

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

    def enregistrer_taux(self, seuil_variation=1.0):
        from suivi_execution.models import Realisation

        # Objectifs valides
        objectifs = self.objectifs_planification.filter(statut='valide')
        if not objectifs.exists():
            return 0.0

        total_cible = sum(getattr(obj, 'cible', 0) or 0 for obj in objectifs)
        if total_cible == 0:
            return 0.0

        # Toutes les réalisations valides
        toutes_realisations = Realisation.objects.filter(
            objectif__in=objectifs,
            est_valide=True
        ).order_by('date_soumission')

        # Initialisation du taux
        taux = 0.0
        total_realise = 0
        dernier = self.historique_taux.order_by('-date_calcul').first()

        for r in toutes_realisations:
            total_realise += getattr(r, 'valeur', 1)
            taux_courant = round((total_realise / total_cible) * 100, 2)

            if not dernier or abs(taux_courant - float(dernier.taux_realisations_valides)) >= seuil_variation:
                dernier = HistoriqueTauxRealisations.objects.create(
                    agent=self,
                    taux_realisations_valides=taux_courant
                )

            taux = taux_courant

        # Retourne 0 si aucune réalisation
        return taux

    def calculer_taux_realisations(self, seuil_variation=1.0):
        from suivi_execution.models import Realisation

        objectifs = self.objectifs_planification.filter(statut='valide')

        if not objectifs.exists():
            taux_realisations = 0
        else:
            total_cible = sum(getattr(obj, 'cible', 0) or 0 for obj in objectifs)
            total_realise = sum(
                obj.realisations.filter(est_valide=True).count()
                for obj in objectifs
            )
            taux_realisations = round((total_realise / total_cible) * 100, 2) if total_cible else 0

        # Comparer avec le dernier historique
        dernier = self.historique_taux.order_by('-date_calcul').first()
        if not dernier or abs(taux_realisations - float(dernier.taux_realisations_valides)) >= seuil_variation:
            HistoriqueTauxRealisations.objects.create(
                agent=self,
                taux_realisations_valides=taux_realisations
            )

        return taux_realisations

    def enregistrer_taux(self, seuil_variation=1.0):
        from suivi_execution.models import Realisation

        objectifs = self.objectifs_planification.filter(statut='valide')
        if not objectifs.exists():
            return 0

        total_cible = sum(getattr(obj, 'cible', 0) or 0 for obj in objectifs)
        if total_cible == 0:
            return 0

        # Tri des réalisations par date pour créer un historique progressif
        toutes_realisations = Realisation.objects.filter(
            objectif__in=objectifs, est_valide=True
        ).order_by('date_soumission')

        total_realise = 0
        dernier = self.historique_taux.order_by('-date_calcul').first()

        # ⚠️ Initialisation de taux
        taux = 0.0

        for r in toutes_realisations:
            total_realise += 1
            taux = round((total_realise / total_cible) * 100, 2)

            # Crée un historique si variation >= seuil
            if not dernier or abs(taux - float(dernier.taux_realisations_valides)) >= seuil_variation:
                dernier = HistoriqueTauxRealisations.objects.create(
                    agent=self,
                    taux_realisations_valides=taux
                )

        return taux


class HistoriquePerformance(models.Model):
    agent = models.ForeignKey('Agent', on_delete=models.CASCADE, related_name='historique_performances')
    performance = models.DecimalField(max_digits=5, decimal_places=2)
    taux_realisations_valides = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # ✅ Ajouté ici

    date_calcul = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-date_calcul']  # plus récent en premier

    def __str__(self):
        return f"Performance de {self.agent} : {self.performance}% le {self.date_calcul.strftime('%Y-%m-%d %H:%M')}"

def archiver_performance_periode(periode_id: int):
    """
    Enregistre la performance_ponderee (performance_moyenne) de chaque agent
    pour une période d'évaluation terminée dans HistoriqueEvaluation.
    """
    # Import à l’intérieur pour éviter les imports circulaires
    from evaluation.models import HistoriqueEvaluation
    from accounts.models import Agent

    try:
        periode = Periode.objects.get(id=periode_id)
    except Periode.DoesNotExist:
        raise ValueError(f"Période {periode_id} introuvable.")

    if not periode.date_fin or periode.date_fin > timezone.now().date():
        raise ValueError("Impossible d’archiver : la période n’est pas encore terminée.")

    agents = Agent.objects.all()
    created_count = 0

    for agent in agents:
        perf = agent.performance_moyenne or 0  # on prend la valeur déjà calculée
        HistoriqueEvaluation.objects.update_or_create(
            agent=agent,
            periode=periode,
            defaults={'performance_ponderee': perf}
        )
        created_count += 1

    return f"{created_count} enregistrements d’évaluation archivés pour {periode.libelle_periode}"

class HistoriqueTauxRealisations(models.Model):
    agent = models.ForeignKey('Agent', on_delete=models.CASCADE, related_name='historique_taux')
    taux_realisations_valides = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    date_calcul = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-date_calcul']

    def __str__(self):
        return f"{self.agent} : {self.taux_realisations_valides}% le {self.date_calcul.strftime('%Y-%m-%d %H:%M')}"
