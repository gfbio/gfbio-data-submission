# -*- coding: utf-8 -*-
import csv
import logging
import unicodedata
import xml.etree.ElementTree as ET
import xml.dom.minidom
from django.utils.encoding import smart_str

from config.celery_app import app
from ...models.task_progress_report import TaskProgressReport
from ...tasks.submission_task import SubmissionTask
from ...utils.task_utils import get_submission

logger = logging.getLogger(__name__)

# TODO: this is just a placeholder to get some sort of xml from the test-data.
#  REMOVE once a proper parsing has been added
def dumb_bruteforce_csv_to_xml(file_path):
    with open(file_path, 'rt') as upload_file:
        header = upload_file.readline()
        print(header)
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

    if not submission.release:
        logger.warning(
            "parse_atax_uploads.py | parse_atax_uploads_task | "
            "trying to parse files of unreleased submission | release={0} | "
            "submission_id={1}".format(submission.release, submission.id)
        )
        return TaskProgressReport.CANCELLED

    # ----- TODO ---- move to module(s)

    for upload in submission.submissionupload_set.all():
        print('\n', upload, ' --------------------------------------------')
        xml_string = dumb_bruteforce_csv_to_xml(upload.file.path)

    # ----- TODO ---- END move to module(s)

    # DONE - TODO: submission has to be released=True
    # DONE (more would be better) - TODO: extend testdata to real taxonimics csvs (test_data ? new examples from miguel ?)
    # TODO: iterate all uploads associated to this submission
    # TODO: content of every file has to be parsed to XML
    # TODO: store content in AuditableTextData associated to submission
    # TODO: return taskresult suitble to be use in atax chain
    # TODO: add new tasks to celery app list for (auto)discover
    return True, submission.broker_submission_id



