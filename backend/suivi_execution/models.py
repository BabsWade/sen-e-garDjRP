# suivi_execution/models.py
from datetime import timezone

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from accounts.models import Agent  # Assure-toi que l'importation est correcte
from planification_alignement.models import Objectif  # Lien avec Objectif dans F2

from planification_alignement.models import Periode


class Realisation(models.Model):
    """
    Une réalisation concrète d’un objectif par un agent.
    """
    objectif = models.ForeignKey(
        'planification_alignement.Objectif',
        related_name='realisations',
        on_delete=models.CASCADE
    )


    agent = models.ForeignKey(
        'accounts.Agent',
        on_delete=models.CASCADE,
        related_name='realisations'
    )
    date_validation = models.DateTimeField(null=True, blank=True)
    suivi_intermediare = models.BooleanField(default=False)
    valeur = models.FloatField(default=0, help_text="Valeur réalisée pour l’objectif")
    commentaire = models.TextField(blank=True, null=True)
    feedback = models.TextField(blank=True, null=True)
    preuve = models.FileField(upload_to='preuves/', null=True, blank=True)
    # ✅ Champs de validation
    est_valide = models.BooleanField(default=False)
    est_rejete = models.BooleanField(default=False)
    commentaire_rejet = models.TextField(blank=True, null=True)
    feedback_comportement = models.TextField(blank=True, null=True)
    # ✅ Suivi des dates
    date_soumission = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    periode = models.ForeignKey(Periode, on_delete=models.CASCADE, null=True, blank=True)  # ✅ Ajout

    def valider(self):
        """Valide la réalisation."""
        self.est_valide = True
        self.est_rejete = False
        self.date_validation = timezone.now()
        self.save(update_fields=['est_valide', 'est_rejete', 'date_validation'])

    def rejeter(self, commentaire=None):
        """Rejette la réalisation."""
        self.est_valide = False
        self.est_rejete = True
        self.commentaire_rejet = commentaire
        self.date_validation = timezone.now()
        self.save(update_fields=['est_valide', 'est_rejete', 'commentaire_rejet', 'date_validation'])

    def __str__(self):
        return f"Réalisation de {self.agent} - {self.objectif.libelle[:30]}..."




class Notification(models.Model):
    agent = models.ForeignKey('accounts.Agent', on_delete=models.CASCADE, blank=True, null=True)
    message = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=[('Envoyé', 'Envoyé'), ('Lu', 'Lu')], default='Envoyé')
    lue_le = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Notification pour {self.agent}: {self.message[:30]}..."


class HistoriqueTauxExecution(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE)
    date_calcul = models.DateField()
    taux_realisations_objectifs_valides = models.DecimalField(max_digits=5, decimal_places=2)
    performance = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        ordering = ['date_calcul']

class HistoriqueTauxExecution(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE)
    date_calcul = models.DateField()
    performance = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    taux_realisations_objectifs_valides = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        ordering = ['date_calcul']
        unique_together = ('agent', 'date_calcul')  # évite les doublons

