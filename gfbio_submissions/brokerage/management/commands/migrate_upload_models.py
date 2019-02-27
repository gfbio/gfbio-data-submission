# -*- coding: utf-8 -*-

from django.core.management import BaseCommand

from gfbio_submissions.brokerage.models import Submission, SubmissionUpload, \
    SubmissionFileUpload


# FIXME / TODO: test on local development server
class Command(BaseCommand):

    @staticmethod
    def migrate_upload_models():
        submissions = Submission.objects.all()
        print('No. of Submissions', len(submissions))
        for submission in submissions:
            print('\n------------\t{0}\t------------\n'.format(
                submission.broker_submission_id))
            pdfs = submission.primarydatafile_set.all()
            print('PDFs')
            print(pdfs)
            for p in pdfs:
                print('\t{0} | {1}'.format(p.data_file.name, p.migrated))
                # TODO: requires a copy/move command from /primarydate folder to /{bsi} folder (one level up)
                # submission_upload = SubmissionUpload.objects.create(
                #     submission=submission,
                #     site=submission.site,
                #     # file already attached for all PDFs on production system
                #     attach_to_ticket=False,
                #     file=p.data_file
                # )
            sfus = submission.submissionfileupload_set.all()
            print('SFUs')
            print(sfus)
            for s in sfus:
                print('\t{0} | {1}'.format(s.file.name, s.migrated))
                submission_upload = SubmissionUpload.objects.create(
                    submission=submission,
                    site=submission.site,
                    attach_to_ticket=False,
                    file=s.file
                )
                s.migrated = True
                s.save()
        print('\n================================\n')
        all_sfus = SubmissionFileUpload.objects.all()
        for a in all_sfus:
            print('{0} | {1}'.format(a.file.name, a.migrated))
        print('\n================================\n')
        all_uploads = SubmissionUpload.objects.all()
        for a in all_uploads:
            print('{0} | {1}'.format(a.file.name, a.site))
        print('\n================================\n')
        sfu_1 = SubmissionFileUpload.objects.first()
        su_1 = SubmissionUpload.objects.first()
        print(sfu_1.file.read())
        print(su_1.file.name)
        print(su_1.file.read())
        print('\n================================\n')
        sfu_1.delete()
        su_1 = SubmissionUpload.objects.first()
        print(su_1.file.name)
        print(su_1.file.read())

    def handle(self, *args, **options):
        self.migrate_upload_models()
