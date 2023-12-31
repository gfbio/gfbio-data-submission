# Generated by Django 3.0.6 on 2020-05-26 14:16

from django.db import migrations, models
import gfbio_submissions.generic.fields


class Migration(migrations.Migration):
    dependencies = [
        ("generic", "0008_auto_20200525_1240"),
    ]

    operations = [
        migrations.AddField(
            model_name="requestlog",
            name="files",
            field=models.TextField(
                blank=True,
                help_text="Log potential file-data. Explicitly introduced to log requests-library file keyword",
            ),
        ),
        migrations.AddField(
            model_name="requestlog",
            name="json",
            field=gfbio_submissions.generic.fields.JsonDictField(
                default=dict,
                help_text="Log potential json-data. Explicitly introduced to log requests-library json keyword",
            ),
        ),
        migrations.AlterField(
            model_name="requestlog",
            name="data",
            field=models.TextField(
                blank=True,
                help_text="Any kind of payload that comes with this request (if available)",
            ),
        ),
    ]
