# Generated by Django 4.1 on 2024-09-27 14:12

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("submission_profile", "0027_remove_profilefield_placeholder_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="field",
            name="default",
        ),
        migrations.RemoveField(
            model_name="field",
            name="mandatory",
        ),
        migrations.RemoveField(
            model_name="field",
            name="visible",
        ),
    ]