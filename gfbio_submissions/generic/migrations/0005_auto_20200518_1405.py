# Generated by Django 3.0.6 on 2020-05-18 12:05

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("generic", "0004_requestlog_method"),
    ]

    operations = [
        migrations.AlterField(
            model_name="requestlog",
            name="method",
            field=models.IntegerField(
                choices=[(0, "not available"), (1, "POST"), (2, "GET"), (3, "PUT")],
                default=0,
                help_text="Http method used, if available",
            ),
        ),
    ]
