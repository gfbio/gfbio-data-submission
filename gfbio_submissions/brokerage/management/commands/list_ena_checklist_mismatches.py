# -*- coding: utf-8 -*-

import xml.etree.ElementTree as ET

from django.core.management.base import BaseCommand

from config.settings.base import ADMIN_URL
from gfbio_submissions.brokerage.models.auditable_text_data import AuditableTextData


class Command(BaseCommand):
    help = ("lists all submissions with sample.xml that contain a mismatch between 'environmental package' & "
            "'ena-checklist' sample-attributes")

    def handle(self, *args, **kwargs):
        all_text_data = AuditableTextData.objects.all()
        print('submission\t|\tissue-key\t|\tlink\t|\tsample-title')
        for a in all_text_data:
            if 'sample' in a.name:
                try:
                    sample_root = ET.fromstring(a.text_data)
                    for sample in sample_root:
                        title = sample.find('TITLE')
                        env_package_children = sample.findall(".//TAG[.='environmental package']")
                        ena_checklist_children = sample.findall(".//TAG[.='ENA-CHECKLIST']")
                        if len(env_package_children) > 1 or (
                            len(env_package_children) == 1 and len(ena_checklist_children) == 0):
                            print(
                                f'{a.submission.broker_submission_id}\t|\t',
                                f'{a.submission.additionalreference_set.filter(primary=True).first()}\t|\t',
                                f'https://submissions.gfbio.org/{ADMIN_URL}/brokerage/submission/{a.submission.pk}/\t|\t',
                                f'{(title.text if title is not None else "no title available")}'
                            )
                except ET.ParseError as e:
                    print('ERROR parsing: ', e)
