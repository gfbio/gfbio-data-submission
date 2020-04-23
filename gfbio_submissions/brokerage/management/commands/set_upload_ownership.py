# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from gfbio_submissions.brokerage.models import SubmissionUpload


class Command(BaseCommand):
    help = 'Set the user of a SubmissionUpload according to the related ' \
           'Submissions user, if the upload user is None.'

    def handle(self, *args, **kwargs):

        uploads_without_owner = SubmissionUpload.objects.filter(user=None)
        print('\n****************\tuploads_without_owner: {}'
              '\t**************'.format(len(uploads_without_owner)))
        for upload in uploads_without_owner:
            if upload.user is None and upload.submission:
                if upload.submission.user is not None:
                    print('set user for upload.pk={0} to {1}'.format(upload.pk,
                                                                     upload.submission.user))
                    upload.user = upload.submission.user
                    upload.save()
                    print(' ... done !')
                else:
                    print(
                        'set user for upload.pk={0} not possible since '
                        'upload.submission.user is None')
