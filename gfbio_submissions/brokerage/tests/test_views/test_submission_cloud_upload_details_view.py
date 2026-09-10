
from django.test import Client, TestCase
from django.urls import reverse
from django.contrib.auth.models import Permission

from gfbio_submissions.brokerage.configuration.settings import GFBIO_HELPDESK_TICKET
from gfbio_submissions.brokerage.models.submission_cloud_upload import SubmissionCloudUpload
from gfbio_submissions.brokerage.tests.utils import _create_submission_via_serializer
from gfbio_submissions.users.models import User


class SubmissionCloudUploadDetailViewTestCase(TestCase):
    def setUp(self):
        self.owner_user = User.objects.create_user(username="testuser")
        self.other_user = User.objects.create_user(username="otheruser")

        curator_permissions = Permission.objects.filter(
            content_type__app_label="brokerage", codename__endswith="curate_submissions"
        )
        self.curator_user = User.objects.create_user(username="curator")
        self.curator_user.user_permissions.add(*curator_permissions)
        self.curator_user.save()
        self.admin_user = User.objects.create_superuser(username="admin", is_staff=True, is_superuser=True)

        self.client = Client()

        self.submission = _create_submission_via_serializer(username=self.owner_user.username)
        self.owner_user_cloud_upload = SubmissionCloudUpload.objects.create(submission=self.submission, user=self.owner_user)
        self.curator_user_cloud_upload = SubmissionCloudUpload.objects.create(submission=self.submission, user=self.curator_user)
        self.other_user_cloud_upload = SubmissionCloudUpload.objects.create(submission=self.submission, user=self.other_user)


    def _delete_cloud_upload(self, cloud_upload, user=None):
        if user:
            self.client.force_login(user=user)
        url = reverse(
            "brokerage:submissions_cloud_upload_detail",
            kwargs={
                "broker_submission_id": str(self.submission.broker_submission_id),
                "pk": cloud_upload.pk,
            },
        )
        response = self.client.delete(url)
        return response


    def test_delete_cloud_uploads_by_owner(self):
        response = self._delete_cloud_upload(self.owner_user_cloud_upload, self.owner_user)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.owner_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_DELETED)

        response = self._delete_cloud_upload(self.curator_user_cloud_upload, self.owner_user)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.curator_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_DELETED)

        response = self._delete_cloud_upload(self.other_user_cloud_upload, self.other_user)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.other_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_DELETED)


    def test_delete_cloud_uploads_by_curator(self):
        response = self._delete_cloud_upload(self.owner_user_cloud_upload, self.curator_user)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.owner_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_DELETED)

        response = self._delete_cloud_upload(self.curator_user_cloud_upload, self.curator_user)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.curator_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_DELETED)

        response = self._delete_cloud_upload(self.other_user_cloud_upload, self.curator_user)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.other_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_DELETED)


    def test_delete_cloud_uploads_by_admin(self):
        response = self._delete_cloud_upload(self.owner_user_cloud_upload, self.admin_user)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.owner_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_DELETED)

        response = self._delete_cloud_upload(self.curator_user_cloud_upload, self.admin_user)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.curator_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_DELETED)

        response = self._delete_cloud_upload(self.other_user_cloud_upload, self.admin_user)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.other_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_DELETED)


    def test_delete_cloud_uploads_by_other_user(self):
        response = self._delete_cloud_upload(self.owner_user_cloud_upload, self.other_user)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.owner_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_NEW)

        response = self._delete_cloud_upload(self.curator_user_cloud_upload, self.other_user)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.curator_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_NEW)

        response = self._delete_cloud_upload(self.other_user_cloud_upload, self.other_user)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.other_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_DELETED)


    def test_delete_cloud_uploads_by_other_user(self):
        response = self._delete_cloud_upload(self.owner_user_cloud_upload, self.other_user)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.owner_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_NEW)

        response = self._delete_cloud_upload(self.curator_user_cloud_upload, self.other_user)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.curator_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_NEW)

        response = self._delete_cloud_upload(self.other_user_cloud_upload, self.other_user)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.other_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_DELETED)


    def test_delete_cloud_uploads_by_anonymous_user(self):
        response = self._delete_cloud_upload(self.owner_user_cloud_upload)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.owner_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_NEW)

        response = self._delete_cloud_upload(self.curator_user_cloud_upload)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.curator_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_NEW)

        response = self._delete_cloud_upload(self.other_user_cloud_upload)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(SubmissionCloudUpload.objects.get(pk=self.other_user_cloud_upload.pk).status, SubmissionCloudUpload.STATUS_NEW)
