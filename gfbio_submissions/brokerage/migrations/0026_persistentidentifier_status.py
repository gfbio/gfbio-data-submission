# Generated by Django 2.2.3 on 2020-01-17 14:57

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("brokerage", "0025_siteconfiguration_ena_report_server"),
    ]

    operations = [
        migrations.AddField(
            model_name="persistentidentifier",
            name="status",
            field=models.CharField(
                blank=True,
                default="",
                help_text='This field is usually set when ENA Reports are parsed automatically. Thus contains the value of the ENA-Report field "releaseStatus"',
                max_length=24,
            ),
        ),
    ]
