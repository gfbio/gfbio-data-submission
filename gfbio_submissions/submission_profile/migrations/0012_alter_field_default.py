# Generated by Django 4.1 on 2024-06-03 12:43

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("submission_profile", "0011_alter_profile_fields"),
    ]

    operations = [
        migrations.AlterField(
            model_name="field",
            name="default",
            field=models.TextField(blank=True, default="", max_length=64),
        ),
    ]
