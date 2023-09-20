# -*- coding: utf-8 -*-
from django.db import models
from django.utils.encoding import smart_str


class AuditableTextDataManager(models.Manager):
    def assemble_ena_submission_data(self, submission):
        xml_file_names = ['study.xml', 'sample.xml', 'experiment.xml',
                          'run.xml', ]
        request_file_keys = ['study', 'sample', 'experiment', 'run', ]
        # just one hit on the database, then work on queryset
        ena_data = self.filter(submission=submission).filter(
            name__in=xml_file_names)
        res = {}
        for r in request_file_keys:
            obj_qs = ena_data.filter(name__contains=r)
            if len(obj_qs):
                obj = obj_qs.first()
                res[r.upper()] = (
                    '{0}'.format(smart_str(obj.name)),
                    '{0}'.format(smart_str(obj.text_data)))
        return res

    # TODO: this will change once more manifestfile usecases are implemented
    def get_ena_manifest_file(self, submission):
        data = self.filter(submission=submission, name='MANIFEST')
        if len(data) == 1:
            return data.first()
        else:
            return None

    def assemble_atax_submission_uploads(self, submission):

        request_file_keys = ['specimen', 'measurement', 'multimedia', 'combination']

        atax_upload = self.filter(submission=submission).filter(
            name__in=request_file_keys)

        res = {}
        for r in request_file_keys:
            obj_qs = atax_upload.filter(name__contains=r)
            if len(obj_qs):
                obj = obj_qs.first()
                res[r.upper()] = (
                    '{0}'.format(smart_str(obj.name)),
                    '{0}'.format(smart_str(obj.text_data)),
                    '{0}'.format(smart_str(obj.comment)),
                    '{0}'.format(smart_str(obj.atax_file_name)),
                    '{0}'.format(smart_str(obj.atax_xml_valid)),
                    '{0}'.format(smart_str(obj.atax_exp_index)))

        return res
