# -*- coding: utf-8 -*-

import os
from django.test import TestCase

from dt_upload.models import FileUploadRequest, MultiPartUpload
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.users.models import User


class TestSignals(TestCase):
    def test_file_upload_postprocessing(self):
        if not os.path.exists("/mnt/s3bucket/00c0ffee-c0ff-c0ff-c0ff-c0ffeec0ffee"):
            os.mkdir("/mnt/s3bucket/00c0ffee-c0ff-c0ff-c0ff-c0ffeec0ffee")

        if os.path.exists("/mnt/s3bucket/00c0ffee-c0ff-c0ff-c0ff-c0ffeec0ffee/TestFile.txt"):
            os.system("rm /mnt/s3bucket/00c0ffee-c0ff-c0ff-c0ff-c0ffeec0ffee/TestFile.txt")
        
        if not os.path.exists("/mnt/s3bucket/NewFile.txt"):
            with open("/mnt/s3bucket/NewFile.txt", "w+") as f:
                f.write("Content?")
        

        user = User.objects.create(username="user1")

        submission = Submission.objects.create(
            broker_submission_id="00c0ffee-c0ff-c0ff-c0ff-c0ffeec0ffee", user=user, target="ENA", release=False, data={},
        )

        file_upload_request = FileUploadRequest.objects.create(
            original_filename="TestFile.txt",
            file_key="00c0ffee-c0ff-c0ff-c0ff-c0ffeec0ffee/TestFile.txt",
            file_size=17,
            s3_bucket="test-bucket",
            s3_presigned_url="-",
            s3_location=f"https://s3.standin.test/{Submission.broker_submission_id}/TestFile.txt",
            uploaded_file = f"{Submission.broker_submission_id}/TestFile.txt",
            sha256="123",
            md5="123"
        )

        MultiPartUpload.objects.create(file_upload_request=file_upload_request)

        submission_cloud_upload = SubmissionCloudUpload.objects.create(
            submission=submission,
            file_upload=file_upload_request,
            file_upload_id=file_upload_request.id
        )

        submission.save()
        submission_cloud_upload.save()
        file_upload_request.save()

        file_upload_request.uploaded_file = "NewFile.txt"
        file_upload_request.save()

        updated_fur = FileUploadRequest.objects.get(pk = file_upload_request.id)
        self.assertEqual(updated_fur.uploaded_file.name, "00c0ffee-c0ff-c0ff-c0ff-c0ffeec0ffee/TestFile.txt")
        self.assertEqual(updated_fur.sha256, "f19b28ffdf540ce64ff6d96bac98e210d3e032a93e6e959a412807123a50b862")
        self.assertEqual(updated_fur.md5, "6eb0bba440453eb5d5f0235a6fbfeb7a")
        self.assertTrue(os.path.exists("/mnt/s3bucket/00c0ffee-c0ff-c0ff-c0ff-c0ffeec0ffee/TestFile.txt"))
