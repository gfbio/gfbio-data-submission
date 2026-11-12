# -*- coding: utf-8 -*-
import json

from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, TokenAuthentication, BasicAuthentication
from gfbio_submissions.brokerage.models.submission import Submission
from gfbio_submissions.brokerage.utils.checksum_validation_report import get_checksum_validation_report


class ChecksumValidationReportView(APIView):
    authentication_classes = (SessionAuthentication, TokenAuthentication, BasicAuthentication)
    
    def get(self, request, broker_submission_id):       
        submission = Submission.objects.filter(broker_submission_id=broker_submission_id).first()
        if not submission:
            return HttpResponse(status=404)
        if submission.user != request.user and not request.user.is_staff and not request.user.is_superuser and not request.user.has_perm("brokerage.curate_submissions"):
            return HttpResponse(status=403, content="You do not have permission to view this submission's checksum validation report.")

        checksum_report = get_checksum_validation_report(broker_submission_id)

        data = json.dumps(checksum_report, default=lambda o: o.__dict__)
        return HttpResponse(data, content_type="application/json")
