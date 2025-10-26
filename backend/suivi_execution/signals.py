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
# 🔄 Mise à jour des objectifs et performance
# -------------------------------
@receiver([post_save, post_delete], sender=Realisation)
def maj_taux_objectif_et_performance(sender, instance, **kwargs):
    """
    Met à jour le taux d'avancement de l'objectif et la performance de l'agent
    à chaque création, modification ou suppression de réalisation.
    """
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

    # --- éviter de boucler le signal post_save sur Objectif ---
    if getattr(objectif, "_updating_taux", False):
        return

    objectif._updating_taux = True
    objectif.taux_avancement = taux
    objectif.save(update_fields=["taux_avancement"])
    objectif._updating_taux = False

    # --- recalcul de la performance globale de l'agent ---
    if instance.agent:
        old_perf = instance.agent.performance_moyenne
        instance.agent.calculer_performance_ponderee()

        # 🔔 Notification seulement si la performance change
        if instance.agent.performance_moyenne != old_perf:
            Notification.objects.create(
                agent=instance.agent,
                message=f"Votre performance moyenne a été mise à jour : "
                        f"{instance.agent.performance_moyenne:.2f}%",
                date_envoi=timezone.now()
            )


# -------------------------------
# 🎯 Objectif : mise à jour du taux + notifications
# -------------------------------
@receiver(post_save, sender=Objectif)
def maj_et_notif_objectif(sender, instance, created, **kwargs):
    """
    Gère à la fois la mise à jour du taux d'avancement et les notifications
    lors de la création ou de la mise à jour d'un objectif.
    """
    if getattr(instance, "_updating_taux", False):
        return  # évite le re-déclenchement pendant la mise à jour interne

    # --- Calcul du taux d'avancement ---
    realisations_valides = instance.realisations.filter(est_valide=True)
    try:
        cible = float(instance.cible)
    except (ValueError, TypeError):
        cible = None

    taux = (
        0.0 if not cible or cible == 0
        else min((realisations_valides.count() / cible) * 100, 100.0)
    )

    # Mise à jour sans relancer en boucle
    if instance.taux_avancement != taux:
        instance._updating_taux = True
        instance.taux_avancement = taux
        instance.save(update_fields=["taux_avancement"])
        instance._updating_taux = False

    # --- Notifications ---
    if created:
        # Nouveau objectif assigné
        Notification.objects.create(
            agent=instance.agent,
            message=f"Nouvel objectif assigné : {instance.libelle}",
            date_envoi=timezone.now()
        )
    else:
        if instance.statut == "valide":
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
# 👋 Notification de création d'agent
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
    Notifie l'agent quand une de ses réalisations est validée.
    """
    if instance.est_valide:
        Notification.objects.create(
            agent=instance.agent,
            message=f"Votre réalisation pour l’objectif '{instance.objectif.libelle}' a été validée ✅",
            date_envoi=timezone.now()
        )


# -------------------------------
# 💬 Notifications sur les feedbacks
# -------------------------------
@receiver(post_save, sender=Realisation)  # si feedback est dans Realisation
def notif_feedback(sender, instance, **kwargs):
    """
    Notifie l'agent quand un feedback est ajouté à une réalisation.
    """
    if hasattr(instance, "feedback") and instance.feedback:
        Notification.objects.create(
            agent=instance.agent,
            message=f"Nouveau feedback pour l’objectif '{instance.objectif.libelle}': {instance.feedback}",
            date_envoi=timezone.now()
        )

@receiver(post_save, sender=Objectif)
def creer_evaluation_lors_validation(sender, instance, created, **kwargs):
    """
    Crée automatiquement une évaluation quand un objectif devient 'valide'.
    """
    try:
        logger.debug(f"[signal] Objectif sauvegardé id={instance.pk} statut={instance.statut}")
    except Exception:
        pass

    # On veut agir uniquement quand le statut vaut 'valide'
    if instance.statut != "valide":
        return

    # Protection: si pas d'agent, on ne fait rien
    if not instance.agent:
        logger.warning(f"Objectif {instance.pk} n'a pas d'agent ; skip creation Evaluation.")
        return

    # Eviter doublons
    if Evaluation.objects.filter(objectif=instance).exists():
        logger.debug(f"Evaluation déjà existante pour objectif {instance.pk}")
        return

    # Récupère le responsable depuis le bon champ
    responsable = getattr(instance.agent, "responsable", None)
    if not responsable:
        logger.warning(f"Agent {instance.agent} n'a pas de responsable ; pas d'évaluation créée.")
        return

    # Crée l'évaluation
    Evaluation.objects.create(
        agent=instance.agent,
        responsable=responsable,
        objectif=instance,
        statut="à évaluer"
    )
    logger.info(f"Evaluation créée pour objectif {instance.pk} (agent={instance.agent.matricule})")