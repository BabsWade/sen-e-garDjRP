from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_alter_agent_service'),  # vérifie que c'est la dernière migration
        ('planification_alignement', '__latest__'),  # dernière migration du module planification_alignement
    ]

    operations = [
        # Supprimer l'ancienne contrainte FK
        migrations.AlterField(
            model_name='agent',
            name='service',
            field=models.ForeignKey(
                to='planification_alignement.Service',
                on_delete=models.SET_NULL,
                null=True,
                blank=True,
            ),
        ),
    ]
