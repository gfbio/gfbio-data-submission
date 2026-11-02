# -*- coding: utf-8 -*-

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("brokerage", "0081_alter_submission_options_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="submission",
            name="checklist_mapping_failed",
            field=models.BooleanField(default=False),
        ),
    ]
