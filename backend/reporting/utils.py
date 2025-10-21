from reporting.models import AuditLog


def log_action(user, model_name, object_id, action, description=""):
    AuditLog.objects.create(
        user=user,
        model_name=model_name,
        object_id=object_id,
        action=action,
        description=description,
    )
