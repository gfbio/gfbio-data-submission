# -*- coding: utf-8 -*-
import json
import logging
import os
import uuid

from django.core import serializers
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models
from django.db.models import Q
from django.utils.encoding import smart_text
from git import Repo
from model_utils.models import TimeStampedModel

from config.settings.base import ADMINS, AUTH_USER_MODEL, LOCAL_REPOSITORY
from gfbio_submissions.brokerage.configuration.settings import GENERIC, \
    DEFAULT_ENA_CENTER_NAME
from .configuration.settings import ENA, ENA_PANGAEA
from .configuration.settings import SUBMISSION_UPLOAD_RETRY_DELAY
from .fields import JsonDictField
from .managers import AuditableTextDataManager
from .managers import SiteConfigurationManager, \
    SubmissionManager, BrokerObjectManager, TaskProgressReportManager
from .utils.submission_tools import \
    submission_upload_path

logger = logging.getLogger(__name__)


class ResourceCredential(models.Model):
    title = models.SlugField(max_length=128,
                             help_text=
                             'Enter a descriptive title for this instance')
    url = models.CharField(max_length=256,
                           help_text=
                           'Url to which requests will be sent to')
    authentication_string = models.CharField(max_length=128, default='',
                                             blank=True,
                                             help_text=
                                             'In cases where an archive '
                                             'demands some sort of pre-build '
                                             'authentication string or '
                                             'sentence, it is entered here. '
                                             'E.g. ENAs authentication')
    username = models.CharField(max_length=72, default='',
                                help_text=
                                'In case of username/password authentication '
                                'fill this field')
    password = models.CharField(max_length=72, default='',
                                help_text=
                                'In case of username/password authentication '
                                'fill this field')
    comment = models.TextField(default='',
                               blank=True,
                               help_text=
                               'Enter a description or helpful text here')

    def __str__(self):
        return '{}'.format(self.title)


class SiteConfiguration(models.Model):
    SAND = 'SAND'
    DSUB = 'DSUB'
    JIRA_PROJECT_KEYS = (
        (SAND, SAND),
        (DSUB, DSUB),
    )

    title = models.SlugField(max_length=128,
                             unique=True,
                             help_text=
                             'Enter a descriptive title for this instance.')
    site = models.ForeignKey(AUTH_USER_MODEL, null=True,
                             blank=True, related_name='siteconfiguration',
                             on_delete=models.SET_NULL)

    contact = models.EmailField(
        default=ADMINS[0][1],
        help_text='Main contact to address in case of something. '
                  'This will, in any case, serve as a fallback '
                  'when no other person can be determined.')

    release_submissions = models.BooleanField(
        default=False,
        help_text='If this field is unchecked (default), all submission '
                  'requests by this site have to be manually approved by '
                  'staff members. If checked all submissions will be '
                  'automatically send to the respective archives.')
    ena_server = models.ForeignKey(
        ResourceCredential,
        related_name='SiteConfiguration.ena_server+',
        help_text='Select which server and/or account this configuration '
                  'should use to connect to ENA.',
        on_delete=models.PROTECT
    )
    ena_ftp = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name='SiteConfiguration.ena_ftp+',
        help_text='Select which server and/or account this configuration '
                  'should use to connect to access ENA FTP-server.',
        on_delete=models.PROTECT
    )
    pangaea_token_server = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name='SiteConfiguration.pangaea_token_server+',
        help_text='Select which server and/or account this configuration '
                  'should use to connect to Pangaea token server. Via this server, the'
                  'token necessary to access Pangaea-Jira is obtained',
        on_delete=models.PROTECT
    )
    pangaea_jira_server = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name='SiteConfiguration.pangaea_jira_server+',
        help_text='Select which server and/or account this configuration '
                  'should use to connect to Pangaea-Jira. This Server'
                  'represents the actual jira-instance of Pangaea',
        on_delete=models.PROTECT
    )
    # TODO: remove
    gfbio_server = models.ForeignKey(
        ResourceCredential,
        null=True,
        blank=True,
        related_name='SiteConfiguration.gfbio_server+',
        help_text='Select which server and/or account this configuration '
                  'should use to connect to the GFBio portal database for '
                  'accessing submission-registry, research_object, and so on.',
        on_delete=models.PROTECT
    )
    # TODO: remove
    use_gfbio_services = models.BooleanField(
        default=False,
        help_text='If checked additional gfbio-related services will be used '
                  'during a submission. E.g. trying to get a User from the '
                  'gfbio.org database and set its email as reporter-email '
                  'in GFBio helpdesk.'
    )

    helpdesk_server = models.ForeignKey(
        ResourceCredential,
        related_name='SiteConfiguration.helpdesk_server+',
        help_text='Select which server and/or account this configuration '
                  'should use to connect to a JIRA based helpdesk system. In '
                  '99 % of all cases this means the GFBio JIRA helpdesk.',
        on_delete=models.PROTECT
    )

    jira_project_key = models.CharField(choices=JIRA_PROJECT_KEYS, max_length=4,
                                        default=SAND)

    comment = models.TextField(
        default='',
        help_text='Enter a description or helpful text here.')

    objects = SiteConfigurationManager()

    def get_ticket_labels(self, label_type=''):
        return [label.label for label in
                self.ticketlabel_set.filter(label_type=label_type)]

    def __str__(self):
        return '{}'.format(self.title)


class TicketLabel(models.Model):
    PANGAEA_JIRA = 'P'
    GFBIO_HELPDESK_JIRA = 'G'
    LABEL_TYPES = (
        (PANGAEA_JIRA, 'Pangaea JIRA'),
        (GFBIO_HELPDESK_JIRA, 'GFBio-Helpdesk JIRA'),
    )
    site_configuration = models.ForeignKey(SiteConfiguration, null=False,
                                           on_delete=models.PROTECT)
    label_type = models.CharField(max_length=1, choices=LABEL_TYPES)
    label = models.CharField(max_length=256, default='')

    def __str__(self):
        return '{0}_{1}_{2}'.format(self.site_configuration.title,
                                    self.label_type, self.pk)


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
        (GENERIC, GENERIC)
    )

    broker_submission_id = models.UUIDField(primary_key=False,
                                            default=uuid.uuid4)
    site = models.ForeignKey(
        AUTH_USER_MODEL,
        null=True,
        related_name='site_submissions',
        on_delete=models.SET_NULL)
    user = models.ForeignKey(
        AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name='user_submissions',
        on_delete=models.SET_NULL
    )
    # TODO: still needed ?
    site_project_id = models.CharField(max_length=128, blank=True, default='')
    target = models.CharField(max_length=16, choices=TARGETS)
    submitting_user = models.CharField(max_length=72, default='', blank=True,
                                       null=True,
                                       help_text=
                                       'Identifier of submitting user. May '
                                       'vary for different sites, e.g. user-id'
                                       ' from database, uniquq login-name, '
                                       'etc..')
    # TODO: remove in Submission ownership refactoring
    submitting_user_common_information = models.TextField(
        default='',
        blank=True,
        null=True,
        help_text='General information regarding the submitting user in '
                  'free-text form, e.g. full name and/or email-address, ORCID,'
                  ' etc.. . Will be used to fill Helpdesk/Jira fields that ask'
                  ' for this kind of verbose information'
    )
    status = models.CharField(choices=STATUSES, max_length=10, default=OPEN)
    release = models.BooleanField(default=False)

    # TODO: this might be to specific for a general submission model ?
    # TODO: discuss general submission model with subclasses like molecular or similar
    download_url = models.URLField(default='', blank=True)
    center_name = models.ForeignKey(CenterName, null=True,
                                    on_delete=models.SET_NULL)

    data = JsonDictField(default=dict)
    # default to today + 1 year
    # FIXME: setting default dynamically causes new migrations. without migrations default is last date plus 1 year
    embargo = models.DateField(
        # default=datetime.date.today() + datetime.timedelta(days=365),
        null=True,
        blank=True)

    objects = SubmissionManager()

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
    site = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.PROTECT)
    site_project_id = models.CharField(max_length=128, blank=True, default='')
    site_object_id = models.CharField(max_length=128, blank=True, default='')

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
        return '{}_{}'.format(self.site_object_id, self.type)

    # TODO: discuss future usage
    # class Meta:
    #     unique_together = (('type', 'site', 'site_project_id', 'site_object_id'),)


class PersistentIdentifier(models.Model):
    ARCHIVES = (
        ('ENA', 'ENA'),
        ('PAN', 'Pangea'),
    )
    PID_TYPES = (
        ('ACC', 'ENA Accession Number'),
        ('PRJ', 'ENA BioProject ID (primary Accession Number)'),
        # TODO: rename to Pangea specific identifier for doi
        ('DOI', 'Pangea Doi'),
        ('BSA', 'Biosample'),
        ('LBL', 'Generic Label')
    )
    archive = models.CharField(choices=ARCHIVES, max_length=3, default='ENA')
    pid_type = models.CharField(choices=PID_TYPES, max_length=3, default='ACC')
    pid = models.CharField(max_length=256, default='')
    resolver_url = models.URLField(max_length=256, default='', blank=True)
    broker_object = models.ForeignKey(BrokerObject, on_delete=models.CASCADE)
    outgoing_request_id = models.UUIDField(primary_key=False, null=True,
                                           blank=True)

    def __str__(self):
        return '{}'.format(self.pid)


class RequestLog(models.Model):
    INCOMING = '0'
    OUTGOING = '1'
    REQUEST_TYPES = (
        (INCOMING, 'incoming'),
        (OUTGOING, 'outgoing')
    )
    request_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        help_text='Primary-key for RequestLog entries')
    type = models.CharField(
        max_length=1,
        choices=REQUEST_TYPES,
        default=INCOMING,
        help_text='We separate incoming and outgoing requests')
    url = models.TextField(
        help_text='Target url of this Request',
        blank=True
    )
    data = models.TextField(
        blank=True,
        help_text='Any kind of payload that comes '
                  'with with this request (if available)')
    site_user = models.CharField(
        max_length=72,
        help_text='A user of a site registered in our System. E.g. user=joe '
                  '(this value ...) at site=GFBio.org')
    submission_id = models.UUIDField(
        null=True,
        blank=True,
        help_text='The submission this request is associated with')
    response_status = models.IntegerField(
        null=True,
        blank=True,
        help_text='The response-code we send if this is an incoming request. '
                  'Otherwise the status sent by request-target')
    response_content = models.TextField(
        blank=True,
        help_text='The content we send if this is an incoming request. '
                  'Otherwise the content sent by request-target')
    triggered_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        help_text='This will be null for incoming requests Otherwise '
                  '(outgoing request) it will show the id of the incoming '
                  'request, that has triggered this request',
        on_delete=models.SET_NULL,
    )
    request_details = JsonDictField(
        default=dict,
        help_text='This may contain meta-information regarding this request'
    )

    # FIXME: not needed due to usage of TimestampedModel, but old production data needs these fields
    created = models.DateTimeField(auto_now_add=True)
    changed = models.DateTimeField(auto_now=True)

    def __str__(self):
        return '{}'.format(self.request_id)


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


class TaskProgressReport(models.Model):
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

    # FIXME: not needed due to usage of TimestampedModel, but old production data needs these fields
    created = models.DateTimeField(auto_now_add=True)
    changed = models.DateTimeField(auto_now=True)

    objects = TaskProgressReportManager()

    def __str__(self):
        if len(self.task_name):
            return '{0}'.format(self.task_name)
        else:
            return 'unnamed_task'


class SubmissionUpload(TimeStampedModel):
    submission = models.ForeignKey(
        Submission,
        null=True,
        blank=True,
        help_text='Submission associated with this Upload.',
        on_delete=models.CASCADE
    )
    site = models.ForeignKey(
        AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name='site_upload',
        help_text='Related "Site". E.g. gfbio-portal or silva.',
        on_delete=models.PROTECT
    )
    # TODO: once IDM in place, it will be possible to directly assign real users
    user = models.ForeignKey(
        AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name='user_upload',
        help_text='Related "User". E.g. a real person that uses '
                  'the submission frontend',
        on_delete=models.PROTECT
    )
    attach_to_ticket = models.BooleanField(
        default=False,
        help_text='When checked, thus having True as value, every uploaded '
                  'file will be attached to the main helpdesk ticket'
                  'associated with "submission".',
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
        upload_to=submission_upload_path,
        help_text='The actual file uploaded.',
    )

    # TODO: from PrimaryDataFile. new default for attach is -> false
    def save(self, ignore_attach_to_ticket=False, *args, **kwargs):
        super(SubmissionUpload, self).save(*args, **kwargs)
        if self.attach_to_ticket and not ignore_attach_to_ticket:
            from .tasks import \
                attach_to_submission_issue_task
            attach_to_submission_issue_task.apply_async(
                kwargs={
                    'submission_id': '{0}'.format(self.submission.pk),
                    'submission_upload_id': '{0}'.format(self.pk)
                },
                # TODO: rename
                countdown=SUBMISSION_UPLOAD_RETRY_DELAY
            )

    def __str__(self):
        return ' / '.join(reversed(self.file.name.split(os.sep)))


class AuditableTextData(models.Model):
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

    # FIXME: not needed due to usage of TimestampedModel, but old production data needs these fields
    created = models.DateTimeField(auto_now_add=True)
    changed = models.DateTimeField(auto_now=True)

    objects = AuditableTextDataManager()

    def save(self, *args, **kwargs):
        is_update = False
        if self.pk:
            is_update = True
        super(AuditableTextData, self).save(*args, **kwargs)

        serialized = serializers.serialize('json', [self, ],
                                           cls=DjangoJSONEncoder)
        serialized_file_name = '{0}.json'.format(self.__str__())

        repo = Repo(LOCAL_REPOSITORY)
        index = repo.index

        serialized_file_path = os.path.join(repo.working_tree_dir,
                                            serialized_file_name)
        dumped = json.dumps(smart_text(serialized), indent=4,
                            sort_keys=True)
        with open(serialized_file_path, 'w') as serialization_file:
            serialization_file.write(
                dumped
            )
        index.add([serialized_file_path])
        if not is_update:
            msg = 'add new AuditableTextData serialization {0}'.format(
                serialized_file_name)
        else:
            msg = 'update AuditableTextData serialization {0}'.format(
                serialized_file_name)
        index.commit(msg)

    def __str__(self):
        return 'AuditableTextData_{0}'.format(self.data_id)
