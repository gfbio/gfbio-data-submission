# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2019-01-24 15:20
from __future__ import unicode_literals

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('brokerage', '0003_auto_20190122_1507'),
    ]

    operations = [
        migrations.AlterField(
            model_name='submission',
            name='embargo',
            field=models.DateField(blank=True, default=datetime.date(2020, 1, 24), null=True),
        ),
    ]