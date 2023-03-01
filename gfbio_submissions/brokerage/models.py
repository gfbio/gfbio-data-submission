# -*- coding: utf-8 -*-
import logging
import os
import uuid

from django.db import models
from django.contrib.postgres.fields import JSONField
from django.db.models import Q
from model_utils.models import TimeStampedModel

from config.settings.base import AUTH_USER_MODEL
from gfbio_submissions.brokerage.configuration.settings import GENERIC, \
    DEFAULT_ENA_CENTER_NAME
from gfbio_submissions.brokerage.managers import SubmissionUploadManager
from gfbio_submissions.generic.fields import JsonDictField
from .configuration.settings import ENA, ENA_PANGAEA,ATAX
from .configuration.settings import SUBMISSION_UPLOAD_RETRY_DELAY
from .managers import AuditableTextDataManager
from .managers import SubmissionManager, BrokerObjectManager, \
    TaskProgressReportManager
from .storage import OverwriteStorage
from .utils.submission_tools import \
    submission_upload_path, hash_file

logger = logging.getLogger(__name__)

# kommentar
class CenterName(models.Model):
    center_name = models.CharField(max_length=128, default='')

    def __str__(self):
        if self.center_name != '':
            return '{0}'.format(self.center_name)
        else:
            return DEFAULT_ENA_CENTER_NAME


class Submission(TimeStampedModel):
    OPEN = 'OPEN'
    SUBMITTED = 'SUBMITTED'
    CANCELLED = 'CANCELLED'
    ERROR = 'ERROR'
    CLOSED = 'CLOSED'

    STATUSES = [
        (OPEN, OPEN),
        (SUBMITTED, SUBMITTED),
        (CANCELLED, CANCELLED),
        (ERROR, ERROR),
        (CLOSED, CLOSED),
    ]

    TARGETS = (
        (ENA, ENA),
        (ENA_PANGAEA, ENA_PANGAEA),
        (GENERIC, GENERIC),
        (ATAX, ATAX)
    )

    broker_submission_id = models.UUIDField(primary_key=False,
                                            default=uuid.uuid4)

    # TODO: remove after refactoring user-site-relations are done
    # TODO: be careful with existing submissions using this field.
    #  maybe check if user field is used by submission, then first remove user
    #  then rename site to user in 2 migration steps
    # site = models.ForeignKey(
    #     AUTH_USER_MODEL,
    #     null=True,
    #     blank=True,
    #     related_name='site_submissions',
    #     on_delete=models.SET_NULL)
    user = models.ForeignKey(
        AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name='user_submissions',
        on_delete=models.SET_NULL
    )

    target = models.CharField(max_length=16, choices=TARGETS)

    # TODO: investigate where this field is used
    # TODO: adapt to new situation of local users (sso, social, django user)
    #  and external (site only)  BE CAREFUL ! LEGACY DATA !
    # submitting_user = models.CharField(max_length=72, default='', blank=True,
    #                                    null=True,
    #                                    help_text=
    #                                    'Identifier of submitting user. May '
    #                                    'vary for different sites, e.g. user-id'
    #                                    ' from database, uniquq login-name, '
    #                                    'etc..')
    # TODO: remove in Submission ownership refactoring. BE CAREFUL ! LEGACY DATA !
    # submitting_user_common_information = models.TextField(
    #     default='',
    #     blank=True,
    #     null=True,
    #     help_text='General information regarding the submitting user in '
    #               'free-text form, e.g. full name and/or email-address, ORCID,'
    #               ' etc.. . Will be used to fill Helpdesk/Jira fields that ask'
    #               ' for this kind of verbose information'
    # )
    status = models.CharField(choices=STATUSES, max_length=10, default=OPEN)
    release = models.BooleanField(default=False)
    approval_notification_sent = models.BooleanField(default=False)

    # TODO: this might be to specific for a general submission model ?
    # TODO: discuss general submission model with subclasses like molecular or similar
    download_url = models.URLField(default='', blank=True)
    center_name = models.ForeignKey(
        CenterName, null=True,
        on_delete=models.SET_NULL,
        help_text='NOTE: When changing the center_name you will have to '
                  'manually create new XML to get XML containing the '
                  'updated center_name. Do so by trigger the '
                  '"Re-Create XML (ENA)" admin action.'
    )

    data = JsonDictField(default=dict)
    # default to today + 1 year
    # FIXME: setting default dynamically causes new migrations. without migrations default is last date plus 1 year
    embargo = models.DateField(
        null=True,
        blank=True)

    objects = SubmissionManager()

    # get first PRJ object
    def get_primary_accession(self):
        try:
            broker_objects = self.brokerobject_set.filter(type='study')
            for obj in broker_objects:
                for pid in obj.persistentidentifier_set.filter(pid_type='PRJ'):
                    # return first object, in theory should be only one
                    return pid
            return None
        except IndexError:
            return None

    # for frontend
    def get_accession_id(self):
        try:
            broker_objects = self.brokerobject_set.filter(type='study')
            data = []
            for broker_object in broker_objects:
                for persistentidentifier_object in broker_object.persistentidentifier_set.filter(
                        pid_type='PRJ'):
                    data.append({"pid": persistentidentifier_object.pid,
                                 "status": persistentidentifier_object.status})
            return data
        except IndexError:
            return []

    # TODO: refactor/move: too specific (molecular submission)
    def get_json_with_aliases(self, alias_postfix):
        new_study_alias, study = self.set_study_alias(alias_postfix)
        sample_aliases, samples = self.set_sample_aliases(alias_postfix)
        experiment_aliases, experiments = self.set_experiment_aliases(
            alias_postfix,
            new_study_alias,
            sample_aliases
        )
        runs = self.set_run_aliases(alias_postfix, experiment_aliases)

        return study.data, [s.data for s in samples], \
               [s.data for s in experiments], [s.data for s in runs]

    # TODO: refactor/move: too specific (molecular submission)
    def set_run_aliases(self, alias_postfix, experiment_aliases):
        runs = self.brokerobject_set.filter(type='run')
        for r in runs:
            if 'experiment_ref' in r.data.keys():
                r.data['experiment_ref'] = experiment_aliases.get(
                    r.data['experiment_ref'], 'no_sample_descriptor')
                r.data['run_alias'] = '{0}:{1}'.format(r.id, alias_postfix)
        return runs

    # TODO: refactor/move: too specific (molecular submission)
    # FIXME: access to first() in many-to-many relation may cause semantic errors
    def set_study_alias(self, alias_postfix):
        study = self.brokerobject_set.filter(type='study').first()
        new_study_alias = '{0}:{1}'.format(study.id, alias_postfix)
        study.data['study_alias'] = new_study_alias
        return new_study_alias, study

    # TODO: refactor/move: too specific (molecular submission)
    def set_experiment_aliases(self, alias_postfix, new_study_alias,
                               sample_aliases):
        experiments = self.brokerobject_set.filter(type='experiment')
        experiment_aliases = {
            e.data.get('experiment_alias', 'no_experiment_alias'):
                '{0}:{1}'.format(e.id, alias_postfix)
            for e in experiments
        }
        for e in experiments:
            if 'experiment_alias' in e.data.keys():
                e.data['experiment_alias'] = experiment_aliases.get(
                    e.data['experiment_alias'], 'no_experiment_alias')
                e.data['study_ref'] = new_study_alias
                e.data['design']['sample_descriptor'] = sample_aliases.get(
                    e.data['design']['sample_descriptor'],
                    'no_sample_descriptor')

        return experiment_aliases, experiments

    # TODO: refactor/move: too specific (molecular submission)
    def set_sample_aliases(self, alias_postfix):
        samples = self.brokerobject_set.filter(type='sample')
        sample_aliases = {
            s.data.get('sample_alias', 'no_sample_alias'):
                '{0}:{1}'.format(s.id, alias_postfix)
            for s in samples
        }
        for s in samples:
            if 'sample_alias' in s.data.keys():
                s.data['sample_alias'] = sample_aliases.get(
                    s.data['sample_alias'], 'no_sample_alias')

        return sample_aliases, samples

    # TODO: refactor/move: too specific (molecular submission)
    def get_study_json(self):
        return self.brokerobject_set.filter(type='study').first().data

    # TODO: refactor/move: too specific (molecular submission)
    def get_sample_json(self):
        return {
            'samples': [s.data for s in
                        self.brokerobject_set.filter(type='sample')]
        }

    # TODO: refactor/move: too specific (molecular submission)
    def get_experiment_json(self):
        return {
            'experiments': [s.data for s in
                            self.brokerobject_set.filter(type='experiment')]
        }

    # TODO: refactor/move: too specific (molecular submission)
    def get_run_json(self):
        return {
            'runs': [s.data for s in
                     self.brokerobject_set.filter(type='run')]
        }

    # TODO: check if filter for primary makes sense. will deliver only on per submission
    def get_primary_pangaea_references(self):
        return self.additionalreference_set.filter(
            Q(type=AdditionalReference.PANGAEA_JIRA_TICKET) & Q(primary=True))

    def get_primary_reference(self, reference_type):
        issues = self.additionalreference_set.filter(
            Q(type=reference_type) & Q(primary=True))
        if len(issues):
            return issues.first()
        else:
            return None

    def get_primary_helpdesk_reference(self):
        return self.get_primary_reference(
            AdditionalReference.GFBIO_HELPDESK_TICKET)

    def get_primary_pangaea_reference(self):
        return self.get_primary_reference(
            AdditionalReference.PANGAEA_JIRA_TICKET)

    def __str__(self):
        return '{}_{}'.format(self.pk, self.broker_submission_id)


# TODO: ARGH ! this needs discussion ! all changes may have some impact !
class BrokerObject(models.Model):
    ENTITY_TYPES = (
        ('study', 'study'),
        ('sample', 'sample'),
        ('experiment', 'experiment'),
        ('run', 'run'),
        ('submission', 'submission'),
    )
    type = models.CharField(choices=ENTITY_TYPES, max_length=12)
    user = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.PROTECT)
    # site_project_id = models.CharField(max_length=128, blank=True, default='')
    # site_object_id = models.CharField(max_length=128, blank=True, default='')
    object_id = models.CharField(max_length=36, default='')

    def save(self, *args, **kwargs):
        if self.object_id == '':
            self.object_id = '{0}'.format(uuid.uuid4())
        super(BrokerObject, self).save(*args, **kwargs)

    data = JsonDictField(default=dict)
    submissions = models.ManyToManyField(Submission)

    objects = BrokerObjectManager()

    def append_pid_for_pangea_doi(self, doi):
        return self.persistentidentifier_set.create(
            archive='PAN',
            pid_type='DOI',
            pid=doi
        )

    def get_or_create_ena_pid(self, entity_pid, request_id):
        return self.persistentidentifier_set.get_or_create(
            archive='ENA',
            pid=entity_pid,
            defaults={
                'archive': 'ENA',
                'pid_type': 'ACC',
                'pid': entity_pid,
                'outgoing_request_id': request_id,
            },
        )

    # TODO: discuss future usage
    # def natural_key(self):
    #     return self.type, self.site, self.site_project_id, self.site_object_id

    def __str__(self):
        return '{}_{}'.format(self.type, self.object_id)

    # TODO: discuss future usage
    # class Meta:
    #     unique_together = (('type', 'site', 'site_project_id', 'site_object_id'),)


class PersistentIdentifier(TimeStampedModel):
    ARCHIVES = (
        ('ENA', 'ENA'),
        ('PAN', 'Pangea'),
    )
    PID_TYPES = (
        ('ACC', 'ENA Accession Number'),
        ('PRJ', 'ENA BioProject ID (primary Accession Number)'),
        ('TSQ', 'ENA Accession for targeted sequence submission'),
        # TODO: rename to Pangea specific identifier for doi
        ('DOI', 'Pangea Doi'),
        ('BSA', 'Biosample'),
        ('LBL', 'Generic Label')
    )
    archive = models.CharField(choices=ARCHIVES, max_length=3, default='ENA')
    pid_type = models.CharField(choices=PID_TYPES, max_length=3, default='ACC')
    pid = models.CharField(max_length=256, default='')
    status = models.CharField(
        max_length=24,
        default='',
        blank=True,
        help_text='This field is usually set when ENA Reports are parsed '
                  'automatically. Thus contains the value of the ENA-Report '
                  'field "releaseStatus"'
    )
    hold_date = models.DateField(
        null=True,
        blank=True)
    resolver_url = models.URLField(max_length=256, default='', blank=True)
    broker_object = models.ForeignKey(BrokerObject, on_delete=models.CASCADE)
    outgoing_request_id = models.UUIDField(primary_key=False, null=True,
                                           blank=True)
    # notify user 2 weeks before the embargo ends
    user_notified = models.DateField(
        null=True,
        blank=True)

    # notify user when ena status changed to PUBLIC
    user_notified_released = models.DateField(
        null=True,
        blank=True)

    def __str__(self):
        return '{}'.format(self.pid)


class EnaReport(TimeStampedModel):
    STUDY = 'STU'
    SAMPLE = 'SAM'
    EXPERIMENT = 'EXP'
    RUN = 'RUN'

    REPORT_TYPES = [
        (STUDY, 'studies'),
        (SAMPLE, 'samples'),
        (EXPERIMENT, 'experiments'),
        (RUN, 'runs'),
    ]

    report_type = models.CharField(max_length=3, choices=REPORT_TYPES,
                                   default=STUDY)
    report_data = JSONField()

    def __str__(self):
        return '{}'.format(self.get_report_type_display())


# TODO: in general a candiate for generic app. but has FK to submission
class AdditionalReference(models.Model):
    GFBIO_HELPDESK_TICKET = '0'
    PANGAEA_JIRA_TICKET = '1'
    REFERENCE_TYPES = (
        (GFBIO_HELPDESK_TICKET, 'gfbio_helpdesk_ticket'),
        (PANGAEA_JIRA_TICKET, 'pangaea_jira_ticket'),
    )
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    type = models.CharField(max_length=1, choices=REFERENCE_TYPES,
                            default=GFBIO_HELPDESK_TICKET)
    primary = models.BooleanField(
        default=False,
        help_text='Only primary tickets are updated. Once set all primary '
                  'fields of other AdditionalReferences of this type and with '
                  'this relation are set to False')
    reference_key = models.CharField(max_length=128, blank=True, default='')

    def save(self, *args, **kwargs):
        if self.primary:
            other_references = AdditionalReference.objects.filter(
                primary=True).filter(type=self.type).filter(
                submission=self.submission)
            for reference in other_references:
                reference.primary = False
                reference.save()
        super(AdditionalReference, self).save(*args, **kwargs)

    def __str__(self):
        return '{}'.format(self.reference_key)


# TODO: in general a candiate for generic app. but has FK to submission
class TaskProgressReport(TimeStampedModel):
    RUNNING = 'RUNNING'
    CANCELLED = 'CANCELLED'
    submission = models.ForeignKey(Submission, null=True, blank=True,
                                   help_text='Submission this Task is working on',
                                   on_delete=models.SET_NULL)
    task_name = models.CharField(max_length=128,
                                 help_text='Name of Task, as registered in celery')
    task_id = models.UUIDField(default=uuid.uuid4, primary_key=True,
                               help_text='UUID identifying this task. Will be '
                                         'provided via the Task itself, but '
                                         'defaults to randon uuid')
    status = models.CharField(max_length=16, default=RUNNING,
                              help_text='Current State of Task')

    task_return_value = models.TextField(default='')
    task_exception = models.TextField(default='')
    task_exception_info = models.TextField(default='')
    task_args = models.TextField(default='')
    task_kwargs = models.TextField(default='')

    objects = TaskProgressReportManager()

    def __str__(self):
        if len(self.task_name):
            return '{0}'.format(self.task_name)
        else:
            return 'unnamed_task'


# TODO: in general a candiate for generic app. but has FK to submission.
#  Upload is pretty generic, name could be more generic here, only thing special
#   is the attack to ticket field and related stuff in save()
#   --> maybe a candiate for abstract app, where all field except FK are predefined
class SubmissionUpload(TimeStampedModel):
    submission = models.ForeignKey(
        Submission,
        null=True,
        blank=True,
        help_text='Submission associated with this Upload.',
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name='user_uploads',
        help_text='Owner of this SubmissionUpload. '
                  'Same as related submission.user',
        on_delete=models.SET_NULL
    )
    # TODO: previous version: site&user
    # site = models.ForeignKey(
    #     AUTH_USER_MODEL,
    #     null=True,
    #     blank=True,
    #     related_name='site_upload',
    #     help_text='Related "Site". E.g. gfbio-portal or silva.',
    #     on_delete=models.SET_NULL
    # )
    # TODO: once IDM in place, it will be possible to directly assign real users
    # user = models.ForeignKey(
    #     AUTH_USER_MODEL,
    #     null=True,
    #     blank=True,
    #     related_name='user_upload',
    #     help_text='Related "User". E.g. a real person that uses '
    #               'the submission frontend',
    #     on_delete=models.SET_NULL
    # )
    attach_to_ticket = models.BooleanField(
        default=False,
        help_text='If checked, thus having True as value, every uploaded '
                  'file will be attached to the main helpdesk ticket'
                  'associated with "submission".',
    )

    modified_recently = models.BooleanField(
        default=False,
        help_text='Checked automatically if "file" has been updated and '
                  'its content/md5_checksum has changed'
    )

    attachment_id = models.IntegerField(
        null=True,
        blank=True,
        help_text='If file is attached to a ticket, it might be useful to store'
                  ' the primary identifier of the attachment. Needed e.g. for'
                  ' removing an attachment from a ticket.'
    )
    meta_data = models.BooleanField(
        default=False,
        help_text='A True/checked value means that this file contains '
                  'meta-data.'
    )
    file = models.FileField(
        max_length=220,
        upload_to=submission_upload_path,
        storage=OverwriteStorage(),
        help_text='The actual file uploaded.',
    )

    md5_checksum = models.CharField(
        blank=True,
        max_length=32,
        default='',
        help_text='MD5 checksum of "file"'
    )

    objects = SubmissionUploadManager()

    def save(self, ignore_attach_to_ticket=False, *args, **kwargs):
        # TODO: consider task/chain for this. every new/save resets md5 to '' then task is
        #   put to queue
        if self.pk is None:
            self.md5_checksum = hash_file(self.file)
        else:
            md5 = hash_file(self.file)
            if md5 != self.md5_checksum:
                self.modified_recently = True
                self.md5_checksum = md5
        super(SubmissionUpload, self).save(*args, **kwargs)
        if self.attach_to_ticket and not ignore_attach_to_ticket:
            from .tasks import \
                attach_to_submission_issue_task
            attach_to_submission_issue_task.apply_async(
                kwargs={
                    'submission_id': '{0}'.format(self.submission.pk),
                    'submission_upload_id': '{0}'.format(self.pk)
                },
                countdown=SUBMISSION_UPLOAD_RETRY_DELAY
            )

    def __str__(self):
        return ' / '.join(reversed(self.file.name.split(os.sep)))


# TODO: FK to submission, either keep this here and focus on xml for molecular,
#  or move to generic or abstract. read about logic/code in abstract classes vs
#   instanced classes
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


class JiraMessage(TimeStampedModel):
    name = models.CharField(
        max_length=128,
        blank=False,
        null=False,
        default='')
    message = models.TextField(
        blank=False,
        null=False,
        help_text="{submitter} - will be replaced with 'Submitter' or user's name if found<br />"
                  "{title} - will be replaced with submission's title<br />"
                  "{id} - will be replaced with submission's id<br />"
                  "{primary_accession} - replaced with primary accession number<br />"
                  "{reference} - will be replaced with jira's ticket reference<br />"
                  "{embargo} -  will be replaced with the embargo date"
    )
