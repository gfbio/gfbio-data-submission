# Generated by Django 2.2.3 on 2019-12-03 22:37

from django.db import migrations, models
import gfbio_submissions.brokerage.storage
import gfbio_submissions.brokerage.utils.submission_tools


class Migration(migrations.Migration):
    dependencies = [
        ("brokerage", "0015_auto_20191203_2225"),
    ]

    operations = [
        migrations.AlterField(
            model_name="submissionupload",
            name="file",
            field=models.FileField(
                help_text="The actual file uploaded.",
                storage=gfbio_submissions.brokerage.storage.OverwriteStorage(),
                upload_to=gfbio_submissions.brokerage.utils.submission_tools.submission_upload_path,
            ),
        ),
    ]
