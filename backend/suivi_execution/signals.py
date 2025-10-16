# suivi_execution/signals.py
import logging

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Realisation
from planification_alignement.models import Objectif

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Realisation)
def maj_taux_avancement_on_save(sender, instance, **kwargs):
    objectif = instance.objectif
    if not objectif:
        return

    # Filtrer les réalisations validées seulement
    realisations_valides = objectif.realisations.filter(est_valide=True)

    if not realisations_valides.exists():
        objectif.taux_avancement = 0.0
    else:
        total = sum(r.taux_avancement for r in realisations_valides)
        count = realisations_valides.count()
        taux = total / count
        objectif.taux_avancement = taux

    objectif.save(update_fields=['taux_avancement'])

@receiver(post_delete, sender=Realisation)
def maj_taux_avancement_on_delete(sender, instance, **kwargs):
    objectif = instance.objectif
    if not objectif:
        return

    realisations_valides = objectif.realisations.filter(est_valide=True)

    if not realisations_valides.exists():
        objectif.taux_avancement = 0.0
    else:
        total = sum(r.taux_avancement for r in realisations_valides)
        count = realisations_valides.count()
        taux = total / count
        objectif.taux_avancement = taux

    objectif.save(update_fields=['taux_avancement'])
