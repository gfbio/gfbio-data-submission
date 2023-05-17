# Generated by Django 4.0.8 on 2023-02-06 15:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('brokerage', '0052_alter_additionalreference_id_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='submission',
            name='target',
            field=models.CharField(choices=[('ENA', 'ENA'), ('ENA_PANGAEA', 'ENA_PANGAEA'), ('GENERIC', 'GENERIC'), ('ATAX', 'ATAX')], max_length=16),
        ),
    ]