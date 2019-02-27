# -*- coding: utf-8 -*-
import os
import shutil

from django.core.management import BaseCommand

from gfbio_submissions.brokerage.models import Submission


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
                            # TODO: create SubmisisonUpload and mark migrated, compate SubmissionFileUpload code below
                            print(
                                '\tnew path exiting: {0} | old path existing: '
                                '{1}'.format(
                                    os.path.exists(new_path),
                                    os.path.exists(file_path)
                                )
                            )
                        else:
                            print('something is wrong with path for '
                                  'primarydatafile: {0}'.format(file_path))
                else:
                    print(' ... path not existing. most likely no uploaded '
                          'files for this submission')
        else:
            print('something is wrong with path: {0}'.format(media_path))

            # print(head)
            # print(tail)
            #     # print(p.data_file.read())
            #     fixed_path = 'gfbio_submission/media/{0}'.format(p.data_file.name)
            #     path = os.path.abspath(fixed_path)
            #     # print(path)
            #     # print(os.path.exists(path))
            #     head, tail = os.path.split(path)
            #     # print((head, tail))
            #     head = head.replace('primary_data_files', '')
            #     # print(head)
            #     # print(os.path.exists(head))
            #     print(path)
            #     print(os.path.exists(path))
            #     new_path = '{0}{1}'.format(head, tail)
            #     print(new_path)
            #     print(os.path.exists(new_path))
            #     # print(os.listdir(head))
            #     # shutil.move(path, new_path)

            # TODO: requires a copy/move command from /primarydate folder to /{bsi} folder (one level up)
            # submission_upload = SubmissionUpload.objects.create(
            #     submission=submission,
            #     site=submission.site,
            #     # file already attached for all PDFs on production system
            #     attach_to_ticket=False,
            #     file=p.data_file
            # )
            # sfus = submission.submissionfileupload_set.all()
            # print('SFUs')
            # print(sfus)
            # for s in sfus:
            #     print('\t{0} | {1}'.format(s.file.name, s.migrated))
            #     submission_upload = SubmissionUpload.objects.create(
            #         submission=submission,
            #         site=submission.site,
            #         attach_to_ticket=False,
            #         file=s.file
            #     )
            #     s.migrated = True
            #     s.save()
            print('\n================================\n')
            # all_sfus = SubmissionFileUpload.objects.all()
            # for a in all_sfus:
            #     print('{0} | {1}'.format(a.file.name, a.migrated))
            # print('\n================================\n')
            # all_uploads = SubmissionUpload.objects.all()
            # for a in all_uploads:
            #     print('{0} | {1}'.format(a.file.name, a.site))
            # print('\n================================\n')
            # sfu_1 = SubmissionFileUpload.objects.first()
            # su_1 = SubmissionUpload.objects.first()
            # print(sfu_1.file.read())
            # print(su_1.file.name)
            # print(su_1.file.read())
            # print('\n================================\n')
            # sfu_1.delete()
            # su_1 = SubmissionUpload.objects.first()
            # print(su_1.file.name)
            # print(su_1.file.read())


def handle(self, *args, **options):
    self.migrate_upload_models()
