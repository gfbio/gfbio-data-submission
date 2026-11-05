# -*- coding: utf-8 -*-
import json

from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, TokenAuthentication, BasicAuthentication
from gfbio_submissions.brokerage.utils.checksum_validation_report import get_checksum_validation_report


class ChecksumValidationReportView(APIView):
    authentication_classes = (SessionAuthentication, TokenAuthentication, BasicAuthentication)
    
    def get(self, request, broker_submission_id):
        submission_id = self.kwargs.get('broker_submission_id')

        checksum_report = get_checksum_validation_report(submission_id)
        
        def report_to_dict(report):
            dict = report.__dict__.copy()
            dict['checksumfileresults'] = [result.__dict__ for result in report.checksumfileresults]
            return dict

        data = json.dumps(report_to_dict(checksum_report))
        return HttpResponse(data, content_type="application/json")
