# Generated by Django 2.2.3 on 2020-02-13 13:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('brokerage', '0026_persistentidentifier_status'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='siteconfiguration',
            name='site',
        ),
    ]