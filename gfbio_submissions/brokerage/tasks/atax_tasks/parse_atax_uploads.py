# -*- coding: utf-8 -*-
import csv
import logging
import xml.dom.minidom
import xml.etree.ElementTree as ET

from django.db import transaction
from django.utils.encoding import smart_str

from config.celery_app import app
from ...configuration.settings import ATAX
from ...models.auditable_text_data import AuditableTextData
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.task_utils import get_submission

logger = logging.getLogger(__name__)


# TODO: this is just a placeholder to get some sort of xml from the test-data.
#  REMOVE once a proper parsing has been added
def dumb_bruteforce_csv_to_xml(file_path):
    with open(file_path, 'rt') as upload_file:
        header = upload_file.readline()
        dialect = csv.Sniffer().sniff(smart_str(header))
        upload_file.seek(0)
        delimiter = dialect.delimiter if dialect.delimiter in [",", ";", "\t"] else ","
        csv_reader = csv.DictReader(
            upload_file,
            quoting=csv.QUOTE_ALL,
            delimiter=delimiter,
            quotechar='"',
            skipinitialspace=True,
            restkey="extra_columns_found",
            restval="extra_value_found",
        )

        xml_root = ET.Element('data')
        for row in csv_reader:
            row_element = ET.Element('csv-row')
            for col in row:
                # TODO: just clean cols from any stuff that is not suitable for xml
                clean_col = col.replace('"', '').strip(
                ).replace(' ', '-'
                          ).replace(':', ''
                                    ).replace(',', ''
                                              ).replace('(', ''
                                                        ).replace(')', ''
                                                                  ).replace('/', '').replace('﻿', '').replace('+', '')
                col_element = ET.Element(clean_col)
                col_element.text = row[col]
                row_element.append(col_element)
            xml_root.append(row_element)

        xml_string = ET.tostring(xml_root, encoding="unicode", method="xml")
        # xml_string = unicodedata.normalize('NFKD', ET.tostring(xml_root, encoding="unicode", method="xml")).encode('ascii', 'ignore')
        return xml_string


# TODO: remove and replace with proper atx specific csv to xml metho
def store_atx_xml_to_auditable_text_data(submission):
    for upload in submission.submissionupload_set.all():
        xml_string = dumb_bruteforce_csv_to_xml(upload.file.path)
        dom = xml.dom.minidom.parseString(xml_string)
        with transaction.atomic():
            AuditableTextData.objects.create(name=upload.file.name, submission=submission, text_data=dom.toprettyxml())


# FIXME: DASS-2397 is this still needed ? No usages besides Tests ...
@app.task(
    base=SubmissionTask,
    bind=True,
    name="tasks.parse_atax_uploads_task",
)
def parse_atax_uploads_task(
    self,
    previous_result=None,
    submission_id=None):
    logger.info("parse_atax_uploads.py | parse_atax_uploads_task | submission_id={}".format(submission_id))

    if previous_result == TaskProgressReport.CANCELLED:
        logger.warning(
            "parse_atax_uploads.py | parse_atax_uploads_task | "
            "previous task reported={0} | "
            "submission_id={1}".format(TaskProgressReport.CANCELLED, submission_id)
        )
        return TaskProgressReport.CANCELLED

    submission = get_submission(submission_id=submission_id, task=self, include_closed=True)

    if not submission.release or submission.target != ATAX:
        logger.warning(
            "parse_atax_uploads.py | parse_atax_uploads_task | "
            "trying to parse files of unreleased submission OR wrong target | release={0} | target={1}"
            "submission_id={2}".format(submission.release, submission.target, submission.id)
        )
        return TaskProgressReport.CANCELLED

    store_atx_xml_to_auditable_text_data(submission)

    return True
