# Generated by Django 3.0.6 on 2021-01-21 11:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('brokerage', '0045_jiramessage'),
    ]

    operations = [
        migrations.AddField(
            model_name='jiramessage',
            name='name',
            field=models.CharField(default='', max_length=128),
        ),
    ]