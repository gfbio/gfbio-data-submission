# Generated by Django 2.2.3 on 2019-08-02 12:46

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="is_site",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="user",
            name="is_user",
            field=models.BooleanField(default=True),
        ),
    ]
