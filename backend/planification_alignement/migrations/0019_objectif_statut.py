from django.db import migrations
from django.db import migrations, models

def migrate_statut(apps, schema_editor):
    Objectif = apps.get_model('planification_alignement', 'Objectif')
    for obj in Objectif.objects.all():
        if getattr(obj, 'est_valide', False):
            obj.statut = 'valide'
        elif getattr(obj, 'est_rejete', False):
            obj.statut = 'rejete'
        else:
            obj.statut = 'en_attente'
        obj.save()

class Migration(migrations.Migration):

    dependencies = [
        ('planification_alignement', '0018_objectif_objectif_programme_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='objectif',
            name='statut',
            field=models.CharField(
                choices=[('en_attente', 'En attente'), ('valide', 'Validé'), ('rejete', 'Rejeté')],
                default='en_attente',
                max_length=20,
            ),
        ),
        migrations.RunPython(migrate_statut),
    ]
