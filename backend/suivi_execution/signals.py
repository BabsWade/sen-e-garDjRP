from datetime import timedelta

from django.db.models import Sum
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import Realisation, Notification, HistoriqueTauxExecution
from planification_alignement.models import Objectif
from accounts.models import Agent
from evaluation.models import Evaluation
import logging

from accounts.models import HistoriquePerformance

logger = logging.getLogger(__name__)


# -------------------------------
# 🔄 Mise à jour du taux d’avancement et performance
# -------------------------------

@receiver([post_save, post_delete], sender=Realisation)
def maj_taux_objectif_et_performance(sender, instance, **kwargs):
    """
    Met à jour automatiquement le taux d’avancement de l’objectif
    et la performance de l’agent dès qu’une réalisation est créée,
    modifiée, validée ou supprimée.
    """
    objectif = instance.objectif
    if not objectif:
        return

    # 🔹 1. Calcul du taux d’avancement de l’objectif
    realisations_valides = objectif.realisations.filter(est_valide=True)
    cible = float(objectif.cible) if objectif.cible else 0

    taux = 0.0
    if cible > 0:
        taux = min((realisations_valides.count() / cible) * 100, 100.0)

    # 🔹 2. Mise à jour du taux de l’objectif
    if getattr(objectif, "_updating_taux", False):
        return
    objectif._updating_taux = True
    objectif.taux_avancement = taux
    objectif.save(update_fields=["taux_avancement"])
    objectif._updating_taux = False

    # 🔹 3. Recalcul automatique de la performance de l’agent
    if instance.agent:
        old_perf = instance.agent.performance_moyenne
        instance.agent.calculer_performance_ponderee()

        if instance.agent.performance_moyenne != old_perf:
            Notification.objects.create(
                agent=instance.agent,
                message=f"Votre performance moyenne a été mise à jour : "
                        f"{instance.agent.performance_moyenne:.2f}%",
                date_envoi=timezone.now()
            )
# -------------------------------
# 🎯 Objectif : mise à jour du taux + notifications individuelles
# -------------------------------
# -------------------------------
# 🔔 UTILITAIRE : éviter les doublons récents
# -------------------------------
def create_notification_once(agent, message):
    """
    Crée une notification si elle n’a pas déjà été envoyée récemment (1 minute).
    """
    if not agent:
        return None

    recent_exists = Notification.objects.filter(
        agent=agent,
        message=message,
        date_envoi__gte=timezone.now() - timedelta(minutes=1)
    ).exists()

    if not recent_exists:
        return Notification.objects.create(agent=agent, message=message)

    return None


# -------------------------------
# 🎯 Objectif : création et changement de statut
# -------------------------------
@receiver(post_save, sender=Objectif)
def maj_et_notif_objectif(sender, instance, created, **kwargs):
    """
    Met à jour le taux d’avancement et notifie l’agent concerné selon le statut.
    """
    # Évite les boucles de sauvegarde
    if getattr(instance, "_updating_taux", False):
        return

    realisations_valides = instance.realisations.filter(est_valide=True)
    try:
        cible = float(instance.cible)
    except (ValueError, TypeError):
        cible = None

    taux = (
        0.0 if not cible or cible == 0
        else min((realisations_valides.count() / cible) * 100, 100.0)
    )

    if instance.taux_avancement != taux:
        instance._updating_taux = True
        instance.taux_avancement = taux
        instance.save(update_fields=["taux_avancement"])
        instance._updating_taux = False

    # Notifications ciblées pour l’agent
    if not instance.agent:
        return

    if created:
        create_notification_once(
            instance.agent,
            f"Nouvel objectif assigné : {instance.libelle}"
        )
    elif instance.statut == "valide":
        create_notification_once(
            instance.agent,
            f"Votre objectif '{instance.libelle}' a été validé ✅"
        )
    elif instance.statut == "rejete":
        create_notification_once(
            instance.agent,
            f"Votre objectif '{instance.libelle}' a été rejeté ❌"
        )


# -------------------------------
# 👋 Création d’un nouvel agent
# -------------------------------
@receiver(post_save, sender=Agent)
def creer_notification_agent(sender, instance, created, **kwargs):
    """
    Envoie une notification de bienvenue à l’agent lors de sa création.
    """
    if created:
        create_notification_once(
            instance,
            f"Bienvenue {instance.prenom} ! Votre compte a été créé avec succès 🎉"
        )


# -------------------------------
# ✅ Réalisations : validation + feedback
# -------------------------------
@receiver(post_save, sender=Realisation)
def notifier_realisation(sender, instance, created, **kwargs):
    """
    Gère toutes les notifications liées à une réalisation.
    """
    if not instance.agent:
        return

    # Cas 1 : la réalisation vient d’être validée
    if not created and instance.est_valide:
        create_notification_once(
            instance.agent,
            f"Votre réalisation pour l’objectif '{instance.objectif.libelle}' a été validée ✅"
        )

    # Cas 2 : un feedback vient d’être ajouté
    elif not created and instance.feedback:
        create_notification_once(
            instance.agent,
            f"Nouveau feedback pour l’objectif '{instance.objectif.libelle}': {instance.feedback}"
        )
# -------------------------------
# 📋 Création automatique d’évaluation après validation d’un objectif
# -------------------------------
@receiver(post_save, sender=Objectif)
def creer_evaluation_lors_validation(sender, instance, created, **kwargs):
    try:
        logger.debug(f"[signal] Objectif sauvegardé id={instance.pk} statut={instance.statut}")
    except Exception:
        pass

    if instance.statut != "valide" or not instance.agent:
        return

    # ✅ Évite doublons
    if Evaluation.objects.filter(objectif=instance).exists():
        return

    responsable = getattr(instance.agent, "responsable", None)
    if not responsable:
        logger.warning(f"Agent {instance.agent} n’a pas de responsable ; pas d’évaluation créée.")
        return

    Evaluation.objects.create(
        agent=instance.agent,
        responsable=responsable,
        objectif=instance,
        statut="à évaluer"
    )
    logger.info(f"✅ Evaluation créée pour objectif {instance.pk} (agent={instance.agent.matricule})")


@receiver([post_save, post_delete], sender=Realisation)
def maj_historique_taux_execution(sender, instance, **kwargs):
    """
    Met à jour ou crée l'entrée HistoriqueTauxExecution pour l'agent
    à la date du calcul correspondant à la réalisation.
    """
    agent = instance.agent
    # récupère toutes les dates de calcul historiques
    historiques = HistoriquePerformance.objects.filter(agent=agent)

    for h in historiques:
        # Objectifs actifs et validés à cette date
        objectifs = Objectif.objects.filter(agent=agent, date_debut__lte=h.date_calcul, statut='valide')
        total_cible = objectifs.aggregate(total=Sum('cible'))['total'] or 0
        total_realise = Realisation.objects.filter(
            objectif__in=objectifs,
            est_valide=True,
            date_validation__lte=h.date_calcul
        ).count()

        taux = round((total_realise / total_cible) * 100, 2) if total_cible else 0

        # Création ou mise à jour du cache
        HistoriqueTauxExecution.objects.update_or_create(
            agent=agent,
            date_calcul=h.date_calcul,
            defaults={
                'performance': float(h.performance),
                'taux_realisations_objectifs_valides': taux
            }
        )