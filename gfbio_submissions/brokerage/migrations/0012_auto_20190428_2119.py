# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2019-04-28 19:19
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('brokerage', '0011_auto_20190308_1554'),
    ]

    operations = [
        migrations.AlterField(
            model_name='submission',
            name='embargo',
            field=models.DateField(blank=True, null=True),
        ),
    ]