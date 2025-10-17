# suivi_execution/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Realisation
from accounts.models import Agent
from planification_alignement.models import Objectif

@receiver(post_save, sender=Realisation)
def maj_taux_objectif_et_performance(sender, instance, **kwargs):
    objectif = instance.objectif
    if objectif:
        # Recalculer taux_avancement pour l’objectif (avec le filtre est_valide)
        realisations_valides = objectif.realisations.filter(est_valide=True)
        if not realisations_valides.exists():
            objectif.taux_avancement = 0.0
        else:
            total = sum(r.taux_avancement for r in realisations_valides)
            count = realisations_valides.count()
            objectif.taux_avancement = total / count
        objectif.save(update_fields=['taux_avancement'])
    # Puis recalculer performance de l’agent associé
    agent = instance.agent
    if agent:
        agent.calculer_performance_ponderee()

@receiver(post_delete, sender=Realisation)
def maj_objetif_performance_apres_suppression(sender, instance, **kwargs):
    objectif = instance.objectif
    if objectif:
        realisations_valides = objectif.realisations.filter(est_valide=True)
        if not realisations_valides.exists():
            objectif.taux_avancement = 0.0
        else:
            total = sum(r.taux_avancement for r in realisations_valides)
            count = realisations_valides.count()
            objectif.taux_avancement = total / count
        objectif.save(update_fields=['taux_avancement'])
    agent = instance.agent
    if agent:
        agent.calculer_performance_ponderee()
