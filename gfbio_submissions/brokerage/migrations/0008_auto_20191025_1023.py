# Generated by Django 2.2.3 on 2019-10-25 10:23

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("brokerage", "0007_auto_20191023_0749"),
    ]

    operations = [
        migrations.AlterField(
            model_name="submission",
            name="user",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="user_submissions",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
