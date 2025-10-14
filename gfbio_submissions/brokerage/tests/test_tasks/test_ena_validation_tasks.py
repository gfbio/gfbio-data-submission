import os

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import ATAX, ENA
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from dt_upload.models import FileUploadRequest
from gfbio_submissions.brokerage.models.submission_report import SubmissionReport
from gfbio_submissions.brokerage.models.submission_upload import SubmissionUpload
from gfbio_submissions.brokerage.tasks.submission_tasks.check_submittable_taxon_id import (
    check_submittable_taxon_id_task,
)
from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path
from gfbio_submissions.generic.configuration.settings import HOSTING_SITE
from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.users.models import User


def run_test_with_fake_submission_upload(submission, user, file_name, local_file_path, is_meta_data, test_to_run):

    dir_path = f"/mnt/s3bucket/{submission.broker_submission_id}"
    file_path = f"/mnt/s3bucket/{submission.broker_submission_id}/{file_name}"
    try:
        if dir_path:
            os.makedirs(dir_path)
        if not os.path.exists(dir_path):
            os.mkdir(dir_path)

        if os.path.exists(file_path):
            os.system(f"rm {file_path}")

        with open(os.path.join(_get_test_data_dir_path(), local_file_path), "rb") as data_file:
            file_content = data_file.read()
        with open(file_path, 'w+b') as f:
            f.write(file_content)

        file_upload = FileUploadRequest.objects.create(
            original_filename=file_name,
            file_key=f"{submission.broker_submission_id}/{file_name}",
            file_type="tif",
            status="COMPLETE",
            user=user
        )
        cloud_upload = SubmissionCloudUpload.objects.create(
            submission=submission,
            attach_to_ticket=False,
            meta_data=is_meta_data,
            file_upload=file_upload
        )

        #    file_to_copy = os.path.join(_get_test_data_dir_path(), "csv_files/specimen_table_Platypelis_wrong_sc_name.csv")
        #    os.system(f"cp {file_to_copy} /mnt/s3bucket/{submission.broker_submission_id}/specimen_table_Platypelis_wrong_sc_name.csv")

        test_to_run()
    finally:
        if os.path.exists(dir_path):
            os.system(f"rm -rf {dir_path}")


class TestEnaValidationTasks(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user1 = User.objects.create(username="user1")
        cls.user2 = User.objects.create(username="user2")

        # submission with target ENA
        cls.submission_ena = Submission.objects.create(
            user=cls.user1,
            status=Submission.OPEN,
            target=ENA,
            data={},
        )
        # submission with target ATAX
        cls.submission_atax = Submission.objects.create(
            user=cls.user2,
            status=Submission.OPEN,
            target=ATAX,
            data={},
        )

        resource_cred = ResourceCredential.objects.create(
            title="Resource Title",
            url="https://www.example.com",
            authentication_string="letMeIn",
        )

        site_conf = SiteConfiguration.objects.create(
            title=HOSTING_SITE,
            ena_server=resource_cred,
            ena_report_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment="Default configuration",
            contact="kevin@horstmeier.de",
        )
        cls.user1.site_configuration = site_conf
        cls.user1.is_user = True
        cls.user1.is_site = False
        cls.user1.save()
        cls.user2.site_configuration = site_conf
        cls.user2.is_user = True
        cls.user2.is_site = False
        cls.user2.save()

    @classmethod
    def create_csv_submission_upload(
        cls,
        submission,
        user,
        name="csv_files/upload_alphataxonomic_data.csv",
        file_sub_path="csv_files/specimen_table_Platypelis.csv",
    ):
        with open(os.path.join(_get_test_data_dir_path(), file_sub_path), "rb") as data_file:
            return SubmissionUpload.objects.create(
                submission=submission,
                user=user,
                meta_data=True,
                file=SimpleUploadedFile(name, data_file.read()),
            )

    # test check_submittable_taxon_id_task with target ena submission and valid meta file
    def test_check_submittable_taxon_id_task_target_ena_valid(self):
        self.submission_ena.submissionupload_set.all().delete()
        self.submission_ena.status = Submission.OPEN
        self.submission_ena.save()
        self.create_csv_submission_upload(
            submission=self.submission_ena, user=self.user1, file_sub_path="csv_files/dsub-269_template.csv"
        )
        result = check_submittable_taxon_id_task.apply_async(kwargs={"submission_id": self.submission_ena.pk})

        self.assertTrue(result.successful())
        res = result.get()
        self.assertEqual(
            {
                "data_is_submittable": True,
                "messages": [],
                "submittable_data_check_performed": True,
            },
            res,
        )

    # test check_submittable_taxon_id_task with target ena submission and invalid meta file
    def test_check_submittable_taxon_id_task_target_ena_invalid(self):
        self.submission_ena.submissionupload_set.all().delete()
        self.submission_ena.status = Submission.OPEN
        self.submission_ena.save()
        self.create_csv_submission_upload(
            submission=self.submission_ena, user=self.user1, file_sub_path="csv_files/molecular_metadata.csv"
        )
        result = check_submittable_taxon_id_task.apply_async(kwargs={"submission_id": self.submission_ena.pk})

        self.assertTrue(result.successful())
        res = result.get()
        self.assertEqual(
            {
                "data_is_submittable": False,
                "messages": ["Data with the following taxon ids is not submittable: 1234"],
                "submittable_data_check_performed": True,
            },
            res,
        )
        self.assertEqual(1, len(SubmissionReport.objects.all()))
        self.assertEqual(
            SubmissionReport.objects.first().report, "Data with the following taxon ids is not submittable: 1234"
        )
        self.submission_ena.refresh_from_db()
        self.assertEqual(Submission.ERROR, self.submission_ena.status)

    # test check_submittable_taxon_id_task with target atax submission and valid meta file
    def test_check_submittable_taxon_id_task_target_atax_valid(self):
        self.submission_atax.submissionupload_set.all().delete()
        self.submission_atax.status = Submission.OPEN
        self.submission_atax.save()
        self.create_csv_submission_upload(
            submission=self.submission_atax,
            user=self.user2,
            file_sub_path="csv_files/specimen_table_Platypelis_valid.csv",
        )
        result = check_submittable_taxon_id_task.apply_async(kwargs={"submission_id": self.submission_atax.pk})

        self.assertTrue(result.successful())
        res = result.get()
        self.assertEqual(
            {
                "data_is_submittable": True,
                "messages": [],
                "submittable_data_check_performed": True,
            },
            res,
        )

    # test check_submittable_taxon_id_task with target atax submission and invalid meta file
    def test_check_submittable_taxon_id_task_target_atax_invalid(self):
        self.submission_atax.submissionupload_set.all().delete()
        self.submission_atax.status = Submission.OPEN
        self.submission_atax.save()
        self.create_csv_submission_upload(
            submission=self.submission_atax,
            user=self.user2,
            file_sub_path="csv_files/specimen_table_Platypelis_wrong_sc_name.csv",
        )
        result = check_submittable_taxon_id_task.apply_async(kwargs={"submission_id": self.submission_atax.pk})

        self.assertTrue(result.successful())
        res = result.get()
        self.assertEqual(
            {
                "data_is_submittable": False,
                "messages": [
                    "Data with the following scientific names is not submittable: Platypelis tsaratananaensissis",
                ],
                "submittable_data_check_performed": True,
            },
            res,
        )
        self.assertEqual(1, len(SubmissionReport.objects.all()))
        self.assertEqual(
            SubmissionReport.objects.first().report,
            "Data with the following scientific names is not submittable: Platypelis tsaratananaensissis",
        )
        self.submission_atax.refresh_from_db()
        self.assertEqual(Submission.ERROR, self.submission_atax.status)

    # test check_submittable_taxon_id_task with target atax submission and invalid meta file
    def test_check_submittable_taxon_id_task_target_atax_invalid_with_cloud_submission_upload(self):
        self.submission_atax.submissionupload_set.all().delete()
        self.submission_atax.status = Submission.OPEN
        self.submission_atax.save()

        def test_to_run():
            result = check_submittable_taxon_id_task.apply_async(kwargs={"submission_id": self.submission_atax.pk})

            self.assertTrue(result.successful())
            res = result.get()
            self.assertEqual(
                {
                    "data_is_submittable": False,
                    "messages": [
                        "Data with the following scientific names is not submittable: Platypelis tsaratananaensissis",
                    ],
                    "submittable_data_check_performed": True,
                },
                res,
            )
            self.assertEqual(1, len(SubmissionReport.objects.all()))
            self.assertEqual(
                SubmissionReport.objects.first().report,
                "Data with the following scientific names is not submittable: Platypelis tsaratananaensissis",
            )
            self.submission_atax.refresh_from_db()
            self.assertEqual(Submission.ERROR, self.submission_atax.status)

        run_test_with_fake_submission_upload(
            submission=self.submission_atax,
            user=self.user2,
            file_name="specimen_table_Platypelis_wrong_sc_name.csv",
            local_file_path="csv_files/specimen_table_Platypelis_wrong_sc_name.csv",
            is_meta_data=True,
            test_to_run=test_to_run
        )
