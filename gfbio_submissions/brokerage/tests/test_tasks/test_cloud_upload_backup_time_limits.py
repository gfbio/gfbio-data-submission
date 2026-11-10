# -*- coding: utf-8 -*-
from django.conf import settings
from django.test import SimpleTestCase
from dt_upload.tasks.backup_task import (
    save_to_redundant_storage,
    save_to_redundant_storage_clientside,
    save_to_redundant_storage_clientside_fileupload,
)

from config.celery_app import app
from gfbio_submissions.brokerage.configuration.settings import (
    CLOUD_UPLOAD_BACKUP_MIRROR_SOFT_TIME_LIMIT,
    CLOUD_UPLOAD_BACKUP_MIRROR_TIME_LIMIT,
)

BACKUP_MIRROR_TASK_NAME = "upload.tasks.save_to_redundant_storage_clientside_fileupload"


class TestCloudUploadBackupTimeLimits(SimpleTestCase):
    def test_time_limits_apply_only_to_the_backup_mirror_task(self):
        self.assertEqual(14400, CLOUD_UPLOAD_BACKUP_MIRROR_TIME_LIMIT)
        self.assertEqual(14100, CLOUD_UPLOAD_BACKUP_MIRROR_SOFT_TIME_LIMIT)
        self.assertEqual(4 * 60 * 60, CLOUD_UPLOAD_BACKUP_MIRROR_TIME_LIMIT)
        self.assertEqual(4 * 60 * 60 - 5 * 60, CLOUD_UPLOAD_BACKUP_MIRROR_SOFT_TIME_LIMIT)

        self.assertEqual(14400, save_to_redundant_storage_clientside_fileupload.time_limit)
        self.assertEqual(14100, save_to_redundant_storage_clientside_fileupload.soft_time_limit)
        self.assertLess(
            save_to_redundant_storage_clientside_fileupload.soft_time_limit,
            save_to_redundant_storage_clientside_fileupload.time_limit,
        )

        self.assertIsNone(save_to_redundant_storage.time_limit)
        self.assertIsNone(save_to_redundant_storage.soft_time_limit)
        self.assertIsNone(save_to_redundant_storage_clientside.time_limit)
        self.assertIsNone(save_to_redundant_storage_clientside.soft_time_limit)

        expected_annotations = {
            BACKUP_MIRROR_TASK_NAME: {
                "time_limit": 14400,
                "soft_time_limit": 14100,
            }
        }
        self.assertEqual(expected_annotations, settings.CELERY_TASK_ANNOTATIONS)
        self.assertEqual(list(settings.CELERY_TASK_ANNOTATIONS), [BACKUP_MIRROR_TASK_NAME])
        self.assertEqual(expected_annotations, dict(app.conf.task_annotations))

        self.assertEqual(25 * 60, settings.CELERY_TASK_TIME_LIMIT)
        self.assertEqual(20 * 60, settings.CELERY_TASK_SOFT_TIME_LIMIT)
