# -*- coding: utf-8 -*-
import logging

# from model_utils.models import TimeStampedModel
#
# from gfbio_submissions.brokerage.models.broker_object import BrokerObject
# from gfbio_submissions.brokerage.models.center_name import CenterName
# from gfbio_submissions.brokerage.models.submission import Submission

logger = logging.getLogger(__name__)


# TODO: ARGH ! this needs discussion ! all changes may have some impact !


# TODO: in general a candiate for generic app. but has FK to submission


# TODO: in general a candiate for generic app. but has FK to submission


# TODO: in general a candiate for generic app. but has FK to submission.
#  Upload is pretty generic, name could be more generic here, only thing special
#   is the attack to ticket field and related stuff in save()
#   --> maybe a candiate for abstract app, where all field except FK are predefined


# TODO: later: do a new type of pre_save action for Submission_Upload
# @receiver(pre_save, sender=SubmissionUpload)
# def schema_validation_atax_xml_file(sender, instance, *args, **kwargs):
#  new validation task
# or save result in auditable textdata of submission, if valid
# pass

# TODO: later: do a new type of post_save action for Submission_Upload
# @receiver(post_save, sender=SubmissionUpload)
# def sending_emails_to_curators_or_submitters(sender, instance, *args, **kwargs):
# maybe use this action for sending mails
# pass


# TODO: FK to submission, either keep this here and focus on xml for molecular,
#  or move to generic or abstract. read about logic/code in abstract classes vs
#   instanced classes


