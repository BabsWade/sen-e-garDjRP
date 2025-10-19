from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import signals
from .models import Realisation
from planification_alignement.models import Objectif


@receiver([post_save, post_delete], sender=Realisation)
def maj_taux_objectif_et_performance(sender, instance, **kwargs):
    objectif = instance.objectif
    if not objectif:
        return

    realisations_valides = objectif.realisations.filter(est_valide=True)

    try:
        cible = float(objectif.cible)
    except (ValueError, TypeError):
        cible = None

    if not cible or cible == 0:
        objectif.taux_avancement = 0.0
    else:
        taux = (realisations_valides.count() / cible) * 100
        objectif.taux_avancement = min(taux, 100.0)

    # Sauvegarde du taux sans déclencher le signal post_save
    post_save.disconnect(maj_performance_si_objectif_modifie, sender=Objectif)
    objectif.save(update_fields=['taux_avancement'])
    post_save.connect(maj_performance_si_objectif_modifie, sender=Objectif)

    # Recalcul de la performance globale
    if instance.agent:
        instance.agent.calculer_performance_ponderee()


@receiver(post_save, sender=Objectif)
def maj_performance_si_objectif_modifie(sender, instance, **kwargs):
    """Met à jour la performance de l’agent si la cible ou le poids change"""
    try:
        cible = float(instance.cible)
    except (ValueError, TypeError):
        cible = None

    realisations_valides = instance.realisations.filter(est_valide=True)

    if not cible or cible == 0:
        taux = 0.0
    else:
        taux = min((realisations_valides.count() / cible) * 100, 100.0)

    # Sauvegarde sans relancer ce signal
    post_save.disconnect(maj_performance_si_objectif_modifie, sender=Objectif)
    instance.taux_avancement = taux
    instance.save(update_fields=['taux_avancement'])
    post_save.connect(maj_performance_si_objectif_modifie, sender=Objectif)

    # Recalcul de la performance globale de l’agent
    if instance.agent:
        instance.agent.calculer_performance_ponderee()
