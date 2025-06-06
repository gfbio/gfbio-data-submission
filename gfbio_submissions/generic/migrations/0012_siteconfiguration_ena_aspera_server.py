# Generated by Django 4.1 on 2025-04-25 12:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("generic", "0011_alter_siteconfiguration_pangaea_jira_server_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="siteconfiguration",
            name="ena_aspera_server",
            field=models.ForeignKey(
                blank=True,
                help_text="Select which server and/or account this configuration should use to connect to access ENA Aspera server.",
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="SiteConfiguration.ena_aspera_server+",
                to="generic.resourcecredential",
            ),
        ),
    ]
