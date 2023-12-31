# Generated by Django 2.2.3 on 2020-01-15 10:49

from django.db import migrations
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):
    dependencies = [
        ("brokerage", "0018_auto_20200115_1049"),
    ]

    operations = [
        migrations.AddField(
            model_name="requestlog",
            name="created",
            field=model_utils.fields.AutoCreatedField(
                default=django.utils.timezone.now,
                editable=False,
                verbose_name="created",
            ),
        ),
        migrations.AddField(
            model_name="requestlog",
            name="modified",
            field=model_utils.fields.AutoLastModifiedField(
                default=django.utils.timezone.now,
                editable=False,
                verbose_name="modified",
            ),
        ),
    ]
