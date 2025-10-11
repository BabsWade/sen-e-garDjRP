from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

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

    service = models.ForeignKey('Service', on_delete=models.SET_NULL, null=True, blank=True)
    responsable = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'matricule'
    REQUIRED_FIELDS = ['email', 'nom', 'prenom']

    objects = AgentManager()

    def __str__(self):
        return f"{self.matricule} - {self.nom} {self.prenom}"

    def get_full_name(self):
        return f"{self.nom} {self.prenom}"

    def get_short_name(self):
        return self.prenom

class Service(models.Model):
    nom_service = models.CharField(max_length=100, unique=True)
    code_programme_budgetaire = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return self.nom_service
