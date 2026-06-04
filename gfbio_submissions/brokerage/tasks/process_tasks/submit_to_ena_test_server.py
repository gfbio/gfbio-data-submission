# -*- coding: utf-8 -*-
from ...tasks.submission_task import submission_task
from ...utils.task_utils import send_data_to_ena_for_validation_or_test


@submission_task("tasks.submit_to_ena_test_server_task")
def submit_to_ena_test_server_task(self, submission_id=None, action="ADD"):
    results = send_data_to_ena_for_validation_or_test(self, submission_id, action)
    return results
