from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import Realisation, Notification
from planification_alignement.models import Objectif
from accounts.models import Agent
from evaluation.models import Evaluation
import logging

logger = logging.getLogger(__name__)


# -------------------------------
# 🔄 Mise à jour du taux d’avancement et performance
# -------------------------------
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

    taux = (
        0.0 if not cible or cible == 0
        else min((realisations_valides.count() / cible) * 100, 100.0)
    )

    if getattr(objectif, "_updating_taux", False):
        return

    objectif._updating_taux = True
    objectif.taux_avancement = taux
    objectif.save(update_fields=["taux_avancement"])
    objectif._updating_taux = False

    # ✅ Notification uniquement pour l’agent concerné
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
@receiver(post_save, sender=Objectif)
def maj_et_notif_objectif(sender, instance, created, **kwargs):
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

    # ✅ Notifications ciblées (agent uniquement)
    if created:
        Notification.objects.create(
            agent=instance.agent,
            message=f"Nouvel objectif assigné : {instance.libelle}",
            date_envoi=timezone.now()
        )
    elif instance.statut == "valide":
        Notification.objects.create(
            agent=instance.agent,
            message=f"Votre objectif '{instance.libelle}' a été validé ✅",
            date_envoi=timezone.now()
        )
    elif instance.statut == "rejete":
        Notification.objects.create(
            agent=instance.agent,
            message=f"Votre objectif '{instance.libelle}' a été rejeté ❌",
            date_envoi=timezone.now()
        )


# -------------------------------
# 👋 Notification de création d’un agent
# -------------------------------
@receiver(post_save, sender=Agent)
def creer_notification_agent(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            agent=instance,
            message=f"Bienvenue {instance.prenom} ! Votre compte a été créé avec succès.",
            date_envoi=timezone.now()
        )


# -------------------------------
# ✅ Notifications sur les réalisations validées
# -------------------------------
@receiver(post_save, sender=Realisation)
def notif_realisation_validee(sender, instance, created, **kwargs):
    """
    Notifie uniquement l'agent concerné quand sa réalisation est validée.
    """
    if instance.est_valide and instance.agent:
        Notification.objects.create(
            agent=instance.agent,
            message=f"Votre réalisation pour l’objectif '{instance.objectif.libelle}' a été validée ✅",
            date_envoi=timezone.now()
        )


# -------------------------------
# 💬 Notifications sur les feedbacks
# -------------------------------
@receiver(post_save, sender=Realisation)
def notif_feedback(sender, instance, **kwargs):
    """
    Notifie uniquement l'agent concerné quand un feedback est ajouté.
    """
    if instance.feedback and instance.agent:
        Notification.objects.create(
            agent=instance.agent,
            message=f"Nouveau feedback pour l’objectif '{instance.objectif.libelle}': {instance.feedback}",
            date_envoi=timezone.now()
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
