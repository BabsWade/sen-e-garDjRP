# suivi_execution/models.py
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from accounts.models import Agent  # Assure-toi que l'importation est correcte
from planification_alignement.models import Objectif  # Lien avec Objectif dans F2


class Realisation(models.Model):
    objectif = models.ForeignKey(Objectif, on_delete=models.CASCADE, related_name="realisations")
    agent = models.ForeignKey('accounts.Agent', on_delete=models.SET_NULL, null=True,
                              blank=True)  # Utilisation du nom en chaîne
    description = models.TextField()

    preuve = models.FileField(upload_to='preuves/', null=True, blank=True)
    est_valide = models.BooleanField(default=False)
    est_rejete = models.BooleanField(default=False)
    commentaire_rejet = models.TextField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)  # Feedback du N+1
    feedback_comportement = models.TextField(null=True, blank=True)  # Feedback comportemental du N+1
    date_soumission = models.DateTimeField(auto_now_add=True)
    date_validation = models.DateTimeField(null=True, blank=True)

    # Ajouter des points de suivi intermédiaires (pour les réajustements)
    suivi_intermediaire = models.BooleanField(default=False)
    date_suivi = models.DateTimeField(null=True, blank=True)

    # Contestation de la réalisation
    est_conteste = models.BooleanField(default=False)
    commentaire_contestation = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-date_soumission']

    def __str__(self):
        return f"Réalisation de {self.agent} pour {self.objectif}"


class Notification(models.Model):
    agent = models.ForeignKey('accounts.Agent', on_delete=models.CASCADE, blank=True, null=True)
    message = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=[('Envoyé', 'Envoyé'), ('Lu', 'Lu')], default='Envoyé')
    lue_le = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Notification pour {self.agent}: {self.message[:30]}..."