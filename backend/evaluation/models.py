from django.db import models
from accounts.models import Agent  # Associer l'évaluation à un agent
from planification_alignement.models import Objectif  # Associer l'évaluation aux objectifs
from datetime import datetime

class AutoEvaluation(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE)
    objectif = models.ForeignKey(Objectif, on_delete=models.CASCADE)
    commentaire = models.TextField()  # Commentaire sur l'objectif ou la compétence
    note = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Note de l'auto-évaluation
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"Auto-évaluation de {self.agent} pour {self.objectif}"


class Evaluation(models.Model):
    STATUT_CHOICES = [
        ("à évaluer", "À évaluer"),
        ("en cours", "En cours"),
        ("terminée", "Terminée"),
    ]

    agent = models.ForeignKey(Agent, on_delete=models.CASCADE)
    responsable = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='evaluations')
    objectif = models.ForeignKey(Objectif, on_delete=models.CASCADE)
    note = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    commentaire = models.TextField(null=True, blank=True)
    est_valide = models.BooleanField(default=False)
    evaluation_comportementale = models.TextField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default="à évaluer")

    def __str__(self):
        return f"Évaluation de {self.agent} par {self.responsable}"


class NoteFinale(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE)
    note_finale = models.DecimalField(max_digits=5, decimal_places=2)  # Note finale pondérée
    commentaire = models.TextField()  # Commentaire final du responsable
    date_evaluation = models.DateTimeField(auto_now_add=True)  # Date de l'enregistrement de la note finale
    date_soumission = models.DateTimeField(null=True, blank=True, default=datetime.now)  # Peut être vide

    def __str__(self):
        return f"Note finale de {self.agent}"


class Contestation(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE)
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE)
    commentaire = models.TextField()  # Raison de la contestation
    date_contestation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Contestation de {self.agent} sur l'évaluation {self.evaluation.id}"