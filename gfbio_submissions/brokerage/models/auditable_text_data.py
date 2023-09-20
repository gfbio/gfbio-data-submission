# -*- coding: utf-8 -*-
import uuid

from django.db import models
from model_utils.models import TimeStampedModel

# from gfbio_submissions.brokerage.managers import AuditableTextDataManager
from .submission import Submission
from ..managers.auditable_text_data_manager import AuditableTextDataManager


class AuditableTextData(TimeStampedModel):
    data_id = models.UUIDField(primary_key=False, default=uuid.uuid4)
    name = models.CharField(max_length=128)
    submission = models.ForeignKey(
        Submission,
        null=False,
        blank=False,
        help_text='Associated Submission for this object',
        on_delete=models.CASCADE
    )
    text_data = models.TextField(
        default='',
        blank=True,
        help_text='Main content of this object. E.g. xml, json or any other text-based data.'
    )
    comment = models.TextField(
        default='',
        blank=True,
        help_text='Free text. Any comments or useful information regarding this object'
    )

    atax_file_name = models.CharField(
        blank=True,
        max_length=255,
        default='',
        help_text='Name of submission upload file'
    )

    atax_xml_valid = models.BooleanField(
        default=False,
        help_text="Result of the validation of the xml structure against abcd xml schema",
        verbose_name="validation status",
    )

    atax_exp_index = models.SmallIntegerField(
        default=-1,
        blank=True,
        help_text='single uploads: exponents for powers of two, combination: sum of single upload powers of two'
    )

    objects = AuditableTextDataManager()

    def save(self, *args, **kwargs):
        # is_update = False
        # if self.pk:
        #     is_update = True
        super(AuditableTextData, self).save(*args, **kwargs)

        # serialized = serializers.serialize('json', [self, ],
        #                                    cls=DjangoJSONEncoder)
        # serialized_file_name = '{0}.json'.format(self.__str__())
        #
        # repo = Repo(LOCAL_REPOSITORY)
        # index = repo.index
        #
        # serialized_file_path = os.path.join(repo.working_tree_dir,
        #                                     serialized_file_name)
        # dumped = json.dumps(smart_text(serialized), indent=4,
        #                     sort_keys=True)
        # with open(serialized_file_path, 'w') as serialization_file:
        #     serialization_file.write(
        #         dumped
        #     )
        # index.add([serialized_file_path])
        # if not is_update:
        #     msg = 'add new AuditableTextData serialization {0}'.format(
        #         serialized_file_name)
        # else:
        #     msg = 'update AuditableTextData serialization {0}'.format(
        #         serialized_file_name)
        # index.commit(msg)

    def __str__(self):
        return 'AuditableTextData_{0}'.format(self.data_id)
