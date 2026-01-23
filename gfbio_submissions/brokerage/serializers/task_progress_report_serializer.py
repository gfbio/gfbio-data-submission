from rest_framework import serializers

from ..models.task_progress_report import TaskProgressReport


class TaskProgressReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskProgressReport
        fields = (
            "task_id",
            "task_name",
            "status",
            "task_return_value",
            "task_exception",
            "task_exception_info",
            "task_args",
            "task_kwargs",
            "created",
            "modified",
        )
