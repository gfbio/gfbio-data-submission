# Generated by Django 4.1 on 2025-01-17 10:49

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):
    dependencies = [
        ("dt_upload", "0019_dtupload_filesize"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("brokerage", "0067_abcdconversionresult_warnings"),
    ]

    operations = [
        migrations.CreateModel(
            name="SubmissionCloudUpload",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "created",
                    model_utils.fields.AutoCreatedField(
                        default=django.utils.timezone.now, editable=False, verbose_name="created"
                    ),
                ),
                (
                    "modified",
                    model_utils.fields.AutoLastModifiedField(
                        default=django.utils.timezone.now, editable=False, verbose_name="modified"
                    ),
                ),
                (
                    "attach_to_ticket",
                    models.BooleanField(
                        default=False,
                        help_text="If checked the uploaded file will be attached to the primary helpdesk ticket of the related submission.",
                    ),
                ),
                (
                    "modified_recently",
                    models.BooleanField(
                        default=False,
                        help_text="Checked automatically if 'file' has been updated and its content/md5_checksum has changed",
                    ),
                ),
                (
                    "attachment_id",
                    models.IntegerField(
                        blank=True,
                        help_text="If 'file' is attached to a ticket, 'attachement_id' stores the primary identifier of the attachment. Needed to access the attachment directly in the helpdesk, e.g. for removing an attachment from a ticket.",
                        null=True,
                    ),
                ),
                (
                    "meta_data",
                    models.BooleanField(
                        default=False,
                        help_text="Checked value means that it is assumed that this file contains the 'meta-data' of the related submission. Only one meta-data file per submission is allowed",
                    ),
                ),
                ("file", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to="dt_upload.dtupload")),
                (
                    "submission",
                    models.ForeignKey(
                        blank=True,
                        help_text="Submission associated with this SubmissionCloudUpload.",
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="brokerage.submission",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        help_text="Owner of this SubmissionCloudUpload. Same as related submission.user",
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="user_cloud_uploads",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
    ]
