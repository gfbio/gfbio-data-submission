# -*- coding: utf-8 -*-
import os
import shutil

from django.core.files import File
from django.core.management import BaseCommand

from gfbio_submissions.brokerage.models import Submission, SubmissionUpload


# FIXME / TODO: test on local development server
class Command(BaseCommand):

    @staticmethod
    def migrate_upload_models():
        submissions = Submission.objects.all()
        print('No. of Submissions', len(submissions))

        media_path = '{0}{1}{2}'.format(os.getcwd(), os.sep,
                                        'gfbio_submissions/media/')
        media_path = os.path.abspath(media_path)
        if os.path.exists(media_path):
            for submission in submissions:
                print('\nProcess submission {0}'.format(
                    submission.broker_submission_id))
                submission_path = '{0}{1}{2}'.format(media_path, os.sep,
                                                     submission.broker_submission_id)
                # if not, it means there are no uploads for this submission
                if os.path.exists(submission_path):
                    pdfs = submission.primarydatafile_set.all()
                    for p in pdfs:
                        file_path = '{0}{1}{2}'.format(media_path, os.sep,
                                                       p.data_file.name)
                        if os.path.exists(file_path):
                            head, tail = os.path.split(file_path)
                            head = head.replace('primary_data_files', '')
                            new_path = '{0}{1}'.format(head, tail)
                            print('\tmove\n\t{0}\n\tto\n\t{1}'.format(file_path,
                                                                      new_path))
                            shutil.move(file_path, new_path)
                            print(
                                '\tnew path exiting: {0} | old path existing: '
                                '{1}'.format(
                                    os.path.exists(new_path),
                                    os.path.exists(file_path)
                                )
                            )
                            new_file = open(new_path, 'r')
                            file = File(name=tail, file=new_file)
                            submission_upload = SubmissionUpload.objects.create(
                                submission=submission,
                                site=submission.site,
                                attach_to_ticket=False,
                                file=file
                            )
                            new_file.close()
                            p.migrated = True
                            p.save(attach=False)
                            print('\tNew SubmissionUpload created: {0}'.format(
                                submission_upload))
                        else:
                            print('something is wrong with path for '
                                  'primarydatafile: {0}'.format(file_path))
                    sfus = submission.submissionfileupload_set.all()
                    for s in sfus:
                        print('\n\t{0} | {1}'.format(s.file.name, s.migrated))
                        submission_upload = SubmissionUpload.objects.create(
                            submission=submission,
                            site=submission.site,
                            attach_to_ticket=False,
                            file=s.file
                        )
                        s.migrated = True
                        s.save()
                        print('\tNew SubmissionUpload created: {0}'.format(
                            submission_upload))
                else:
                    print(' ... path not existing. most likely no uploaded '
                          'files for this submission')
        else:
            print('something is wrong with path: {0}'.format(media_path))

    def handle(self, *args, **options):
        self.migrate_upload_models()
