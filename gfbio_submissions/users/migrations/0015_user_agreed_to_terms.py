# Generated by Django 3.0.6 on 2020-09-03 08:51

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0014_remove_user_is_curator"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="agreed_to_terms",
            field=models.BooleanField(default=False),
        ),
    ]
