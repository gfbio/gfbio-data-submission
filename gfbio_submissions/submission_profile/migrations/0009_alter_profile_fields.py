# Generated by Django 4.1 on 2024-05-31 16:28

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("submission_profile", "0008_alter_profile_inherit_fields_from"),
    ]

    operations = [
        migrations.AlterField(
            model_name="profile",
            name="fields",
            field=models.ManyToManyField(blank=True, null=True, to="submission_profile.field"),
        ),
    ]
