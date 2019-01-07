# -*- coding: utf-8 -*-
from django.test import TestCase
from django.utils.encoding import smart_text

from gfbio_submissions.brokerage.models import Submission, CenterName
from gfbio_submissions.brokerage.tests.test_models import SubmissionTest
from gfbio_submissions.brokerage.utils.ena import Enalizer
from gfbio_submissions.users.models import User


class EnalizerTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create(
            username="user1"
        )
        SubmissionTest._create_submission_via_serializer()
        SubmissionTest._create_submission_via_serializer(runs=True)

    def test_with_files_in_experiments(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission=submission, alias_postfix='test')
        self.assertTrue(enalizer.study_alias.endswith(':test'))
        self.assertEqual(enalizer.study_alias,
                         enalizer.experiment[0]['study_ref'])
        self.assertEqual(1, len(enalizer.run))

    def test_with_additional_files_in_experiments(self):
        submission = Submission.objects.last()
        enalizer = Enalizer(submission=submission, alias_postfix='test-runs')
        self.assertTrue(enalizer.study_alias.endswith(':test-runs'))
        self.assertEqual(enalizer.study_alias,
                         enalizer.experiment[0]['study_ref'])
        self.assertEqual(6, len(enalizer.run))

    def test_center_name(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission=submission, alias_postfix='test')
        self.assertEqual('GFBIO', enalizer.center_name)
        center_name, created = CenterName.objects.get_or_create(
            center_name='CustomCenter')
        submission.center_name = center_name
        submission.save()
        enalizer_2 = Enalizer(submission=submission, alias_postfix='test')
        self.assertEqual('CustomCenter', enalizer_2.center_name)

    def test_study_xml(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, 'test-enalizer-study')
        data = enalizer.prepare_submission_data()
        k, study_xml = data.get('STUDY')
        self.assertEqual('study.xml', k)
        self.assertIn('<STUDY_SET>', study_xml)
        self.assertIn('<STUDY', study_xml)
        self.assertIn('<DESCRIPTOR>', study_xml)
        self.assertIn('<STUDY_TYPE', study_xml)
        self.assertIn('<STUDY_TITLE>', study_xml)
        self.assertIn('<STUDY_ABSTRACT>', study_xml)
        study_xml_standalone = enalizer.create_study_xml()
        self.assertEqual(study_xml, smart_text(study_xml_standalone))

    def test_study_xml_center_name(self):
        submission = Submission.objects.first()
        center_name, created = CenterName.objects.get_or_create(
            center_name='CustomCenter')
        submission.center_name = center_name
        submission.save()
        ena = Enalizer(submission, 'test-enalizer-study')
        data = ena.prepare_submission_data()
        k, study_xml = data.get('STUDY')
        self.assertEqual('study.xml', k)
        self.assertIn('center_name="CustomCenter"', study_xml)
        study_xml_standalone = ena.create_study_xml()
        self.assertEqual(study_xml, smart_text(study_xml_standalone))

    def test_sample_xml(self):
        submission = Submission.objects.first()
        enalizer = Enalizer(submission, 'test-enalizer-sample')
        data = enalizer.prepare_submission_data()

        k, sample_xml = data.get('SAMPLE')
        self.assertEqual('sample.xml', k)
        submission_samples = submission.brokerobject_set.filter(type='sample')
        self.assertIn(
            '<SAMPLE alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="GFBIO">'
            '<TITLE>sample title</TITLE>'
            '<SAMPLE_NAME>'
            '<TAXON_ID>530564</TAXON_ID>'
            '</SAMPLE_NAME>'
            '<DESCRIPTION />'.format(submission_samples[0].pk), sample_xml)
        self.assertIn(
            '<SAMPLE alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="GFBIO">'
            '<TITLE>sample title 2</TITLE>'
            '<SAMPLE_NAME>'
            '<TAXON_ID>530564</TAXON_ID>'
            '</SAMPLE_NAME>'
            '<DESCRIPTION />'.format(submission_samples[1].pk), sample_xml)

    def test_sample_xml_center_name(self):
        submission = Submission.objects.first()
        center_name, created = CenterName.objects.get_or_create(
            center_name='CustomCenter')
        submission.center_name = center_name
        submission.save()
        ena = Enalizer(submission, 'test-enalizer-sample')
        data = ena.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        self.assertEqual('sample.xml', k)
        self.assertIn('center_name="CustomCenter"', sample_xml)

    def test_sample_xml_checklist_mapping(self):
        submission = Submission.objects.first()
        ena = Enalizer(submission, 'test-enalizer-sample')
        data = ena.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        self.assertIn(
            '<SAMPLE_ATTRIBUTE>'
            '<TAG>ENA-CHECKLIST</TAG>'
            '<VALUE>ERC000024</VALUE>'
            '</SAMPLE_ATTRIBUTE>',
            sample_xml)
        self.assertIn(
            '<SAMPLE_ATTRIBUTE>'
            '<TAG>ENA-CHECKLIST</TAG>'
            '<VALUE>ERC000023</VALUE>'
            '</SAMPLE_ATTRIBUTE>',
            sample_xml)

    def test_additional_renamed_checklist_attribute(self):
        sub = self._get_submission_with_testdata(add_sample_attributes=True)
        ena = Enalizer(sub, 'test-enalizer-sample')
        data = ena.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        self.assertIn('<TAG>water environmental package</TAG>', sample_xml)
        self.assertIn(
            '<TAG>wastewater sludge environmental package</TAG>',
            sample_xml
        )
    #
    # def test_sample_xml_checklist_mapping_no_package(self):
    #     sub = self._get_submission_with_testdata(add_sample_attributes=False)
    #     ena = Enalizer(sub, 'test-enalizer-sample')
    #     data = ena.prepare_submission_data()
    #     k, sample_xml = data.get('SAMPLE')
    #     sxml = xml.dom.minidom.parseString(sample_xml)
    #     s = sxml.toprettyxml()
    #     self.assertNotIn('<TAG>ENA-CHECKLIST</TAG>', sample_xml)
    #
    # def test_additional_no_renamed_checklist_attribute(self):
    #     sub = self._get_submission_with_testdata(add_sample_attributes=False)
    #     ena = Enalizer(sub, 'test-enalizer-sample')
    #     data = ena.prepare_submission_data()
    #     k, sample_xml = data.get('SAMPLE')
    #     self.assertNotIn('<TAG>water environmental package</TAG>', sample_xml)
    #     self.assertNotIn(
    #         '<TAG>wastewater sludge environmental package</TAG>',
    #         sample_xml
    #     )
    #
    # def test_sample_xml_checklist_mapping_wrong_package(self):
    #     sub = self._get_submission_with_testdata(add_invalid_package=True)
    #     ena = Enalizer(sub, 'test-enalizer-sample')
    #     data = ena.prepare_submission_data()
    #     k, sample_xml = data.get('SAMPLE')
    #     sxml = xml.dom.minidom.parseString(sample_xml)
    #     s = sxml.toprettyxml()
    #     self.assertNotIn('<TAG>ENA-CHECKLIST</TAG>', sample_xml)
    #
    # def test_add_insdc_attribute(self):
    #     sub = self._get_submission_with_testdata()
    #     ena = Enalizer(sub, 'test-enalizer-sample')
    #     data = ena.prepare_submission_data()
    #     k, sample_xml = data.get('SAMPLE')
    #     self.assertEqual(5, sample_xml.count(
    #         '<SAMPLE_ATTRIBUTE><TAG>submitted to insdc</TAG><VALUE>true</VALUE>'))
    #
    # def test_experiment_xml(self):
    #     sub = self._get_submission_with_testdata()
    #     ena = Enalizer(sub, 'test-enalizer-experiment')
    #     self.assertFalse(ena.experiments_contain_files)
    #     data = ena.prepare_submission_data()
    #     k, experiment_xml = data.get('EXPERIMENT')
    #     sxml = xml.dom.minidom.parseString(experiment_xml)
    #     s = sxml.toprettyxml()
    #     self.assertEqual('experiment.xml', k)
    #     submission_experiments = sub.brokerobject_set.filter(type='experiment')
    #     submission_study = sub.brokerobject_set.filter(type='study').first()
    #     submission_samples = sub.brokerobject_set.filter(type='sample')
    #     for i in range(4):
    #         self.assertIn(
    #             '<EXPERIMENT alias="{0}:test-enalizer-experiment" broker_name="GFBIO" center_name="GFBIO"><STUDY_REF refname="{1}:test-enalizer-experiment" /><DESIGN><DESIGN_DESCRIPTION /><SAMPLE_DESCRIPTOR refname="{2}:test-enalizer-experiment" /><LIBRARY_DESCRIPTOR><LIBRARY_STRATEGY>AMPLICON</LIBRARY_STRATEGY><LIBRARY_SOURCE>METAGENOMIC</LIBRARY_SOURCE><LIBRARY_SELECTION>PCR</LIBRARY_SELECTION><LIBRARY_LAYOUT><PAIRED NOMINAL_LENGTH="420" /></LIBRARY_LAYOUT></LIBRARY_DESCRIPTOR></DESIGN><PLATFORM><ILLUMINA><INSTRUMENT_MODEL>Illumina HiSeq 1000</INSTRUMENT_MODEL></ILLUMINA></PLATFORM>'
    #             '</EXPERIMENT>'.format(submission_experiments[i].pk,
    #                                    submission_study.pk,
    #                                    submission_samples[i].pk),
    #             experiment_xml)
    #
    #     self.assertTrue(ena.experiments_contain_files)
    #
    # def test_experiment_xml_center_name(self):
    #     sub = self._get_submission_with_testdata()
    #     center_name, created = CenterName.objects.get_or_create(
    #         center_name='CustomCenter')
    #     sub.center_name = center_name
    #     sub.save()
    #     ena = Enalizer(sub, 'test-enalizer-experiment')
    #     self.assertFalse(ena.experiments_contain_files)
    #     data = ena.prepare_submission_data()
    #     k, experiment_xml = data.get('EXPERIMENT')
    #     sxml = xml.dom.minidom.parseString(experiment_xml)
    #     self.assertEqual('experiment.xml', k)
    #     self.assertIn('center_name="CustomCenter"', experiment_xml)
    #     self.assertTrue(ena.experiments_contain_files)
    #
    # def test_add_experiment_platform_as_sample_attribute(self):
    #     sub = self._get_submission_with_testdata(add_sample_attributes=True)
    #     ena = Enalizer(sub, 'test-enalizer-experiment')
    #     data = ena.prepare_submission_data()
    #     k, experiment_xml = data.get('EXPERIMENT')
    #     k, sample_xml = data.get('SAMPLE')
    #     self.assertIn(
    #         '<PLATFORM><ILLUMINA><INSTRUMENT_MODEL>Illumina HiSeq 1000</INSTRUMENT_MODEL></ILLUMINA></PLATFORM>',
    #         experiment_xml)
    #
    #     self.assertIn(
    #         '<SAMPLE_ATTRIBUTE><TAG>sequencing method</TAG><VALUE>Illumina HiSeq 1000</VALUE></SAMPLE_ATTRIBUTE>',
    #         sample_xml)
    #
    # def test_add_experiment_platform_without_initial_sample_attributes(self):
    #     sub = self._get_submission_with_testdata()
    #     ena = Enalizer(sub, 'test-enalizer-experiment')
    #     data = ena.prepare_submission_data()
    #     k, experiment_xml = data.get('EXPERIMENT')
    #     k, sample_xml = data.get('SAMPLE')
    #     self.assertIn(
    #         '<PLATFORM><ILLUMINA><INSTRUMENT_MODEL>Illumina HiSeq 1000</INSTRUMENT_MODEL></ILLUMINA></PLATFORM>',
    #         experiment_xml)
    #     self.assertIn(
    #         '<SAMPLE_ATTRIBUTE><TAG>sequencing method</TAG><VALUE>Illumina HiSeq 1000</VALUE></SAMPLE_ATTRIBUTE>',
    #         sample_xml)
    #
    # def test_run_xml_with_files_in_experiment(self):
    #     sub = self._get_submission_with_testdata(runs=False)
    #     ena = Enalizer(sub, 'test-enalizer-run')
    #     self.assertFalse(ena.experiments_contain_files)
    #     data = ena.prepare_submission_data()
    #     self.assertTrue(ena.experiments_contain_files)
    #
    #     k, run_xml = data.get('RUN')
    #     sxml = xml.dom.minidom.parseString(run_xml)
    #     s = sxml.toprettyxml()
    #
    # def test_run_xml_with_additional_files_in_experiment(self):
    #     sub = self._get_submission_with_testdata(runs=True)
    #     ena = Enalizer(sub, 'test-enalizer-run')
    #     self.assertFalse(ena.experiments_contain_files)
    #     data = ena.prepare_submission_data()
    #     self.assertTrue(ena.experiments_contain_files)
    #
    #     run_xml = ena.create_run_xml()
    #     sxml = xml.dom.minidom.parseString(run_xml)
    #
    # @skip('just debugging and testing of output for comparison')
    # def test_xml_output(self):
    #
    #     sub = self._get_submission_with_testdata()
    #     ena = Enalizer(sub, 'test-enalizer')
    #
    #     data = ena.prepare_submission_data()
    #
    #     k, study_xml = data.get('STUDY')
    #     sxml = xml.dom.minidom.parseString(study_xml)
    #     s = sxml.toprettyxml()
    #
    #     # ena = Enalizer(
    #     #     study_json=study,
    #     #     sample_json=sample,
    #     #     experiment_json=experiment,
    #     #     run_json={},
    #     # )
    #     # data = ena.prepare_submission_data()
    #     # k, samle_xml = data.get('SAMPLE')
    #     # sxml = xml.dom.minidom.parseString(samle_xml)
    #     # s = sxml.toprettyxml()
    #     # print s
    #
    #     # exp_xml = ena.create_study_xml()
    #     # print 'study:'
    #     # exml = xml.dom.minidom.parseString(exp_xml)
    #     # e = exml.toprettyxml()
    #     # print e
    #     # print '-------------------------------------------'
    #     # print 'sample'
    #     # exp_xml = ena.create_sample_xml()
    #     # exml = xml.dom.minidom.parseString(exp_xml)
    #     # e = exml.toprettyxml()Bor
    #     # print e
    #     # print '-------------------------------------------'
    #     # print 'experiment'
    #     # exp_xml = ena.create_experiment_xml()
    #     # # print 'run'
    #     # # exp_xml = ena.create_run_xml()
    #     # exml = xml.dom.minidom.parseString(exp_xml)
    #     # e = exml.toprettyxml()
    #     # print e
    #
    # def test_submission_data_content(self):
    #     sub = self._get_submission_with_testdata(runs=False)
    #     ena = Enalizer(submission=sub, alias_postfix='outgoing-uuid')
    #     ena_submission_data = ena.prepare_submission_data(
    #         broker_submission_id=sub.broker_submission_id)  # ADD
    #     self.assertListEqual(sorted(['RUN', 'SAMPLE', 'STUDY', 'EXPERIMENT']),
    #                          sorted(list(ena_submission_data.keys())))
    #     self.assertNotIn('SUBMISSION', ena_submission_data.keys())
    #
    # def test_submission_alias(self):
    #     sub = self._get_submission_with_testdata(runs=False)
    #     ena = Enalizer(submission=sub, alias_postfix='outgoing-uuid')
    #     test_id = uuid4()
    #     submission_xml = ena.prepare_submission_xml_for_sending(
    #         action='ADD',
    #         outgoing_request_id=test_id)
    #     k, v = submission_xml
    #     self.assertEqual('submission.xml', k)
    #     self.assertIn('alias="{0}"'.format(test_id), v)
    #
    # @responses.activate
    # def test_send_submission_to_ena(self):
    #     sub = FullWorkflowTest._prepare()
    #     conf = SiteConfiguration.objects.get(title='default')
    #     responses.add(
    #         responses.POST, conf.ena_server.url, status=200,
    #         body=textwrap.dedent("""<?xml version="1.0" encoding="UTF-8"?> <?xml-stylesheet type="text/xsl" href="receipt.xsl"?>
    #              <RECEIPT receiptDate="2015-12-01T11:54:55.723Z" submissionFile="submission.xml"
    #                       success="true">
    #                  <EXPERIMENT accession="ERX1228437" alias="4:f844738b-3304-4db7-858d-b7e47b293bb2"
    #                              status="PRIVATE"/>
    #                  <RUN accession="ERR1149402" alias="5:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE"/>
    #                  <SAMPLE accession="ERS989691" alias="2:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE">
    #                      <EXT_ID accession="SAMEA3682542" type="biosample"/>
    #                      <EXT_ID accession="SAMEA3682543-666" type="sample-this"/>
    #                  </SAMPLE>
    #                  <SAMPLE accession="ERS989692" alias="3:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE">
    #                      <EXT_ID accession="SAMEA3682543" type="biosample"/>
    #                  </SAMPLE>
    #                  <STUDY accession="ERP013438" alias="1:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE"
    #                         holdUntilDate="2016-03-05Z"/>
    #                  <SUBMISSION accession="ERA540869" alias="NGS_March_original2"/>
    #                  <MESSAGES>
    #                      <INFO>ADD action for the following XML: study.xml sample.xml
    #                          experiment.xml run.xml
    #                      </INFO>
    #                  </MESSAGES>
    #                  <ACTIONS>ADD</ACTIONS>
    #                  <ACTIONS>ADD</ACTIONS>
    #                  <ACTIONS>ADD</ACTIONS>
    #                  <ACTIONS>ADD</ACTIONS>
    #                  <ACTIONS>HOLD</ACTIONS>
    #              </RECEIPT>"""))
    #
    #     ena_submission_data = prepare_ena_data(
    #         submission=sub)
    #     response, req_log_request_id = send_submission_to_ena(
    #         submission=sub,
    #         archive_access=conf.ena_server,
    #         ena_submission_data=ena_submission_data,
    #     )
    #     self.assertEqual(req_log_request_id, RequestLog.objects.get(
    #         request_id=req_log_request_id).request_id)
    #     self.assertEqual(200, response.status_code)
    #
    # @responses.activate
    # def test_send_submission_to_ena_without_run_or_experiment(self):
    #     sub = FullWorkflowTest._prepare()
    #     conf = SiteConfiguration.objects.get(title='default')
    #     responses.add(
    #         responses.POST, conf.ena_server.url, status=200,
    #         body=textwrap.dedent("""<?xml version="1.0" encoding="UTF-8"?> <?xml-stylesheet type="text/xsl" href="receipt.xsl"?>
    #                  <RECEIPT receiptDate="2015-12-01T11:54:55.723Z" submissionFile="submission.xml"
    #                           success="true">
    #                      <SAMPLE accession="ERS989691" alias="2:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE">
    #                          <EXT_ID accession="SAMEA3682542" type="biosample"/>
    #                          <EXT_ID accession="SAMEA3682543-666" type="sample-this"/>
    #                      </SAMPLE>
    #                      <SAMPLE accession="ERS989692" alias="3:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE">
    #                          <EXT_ID accession="SAMEA3682543" type="biosample"/>
    #                      </SAMPLE>
    #                      <STUDY accession="ERP013438" alias="1:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE"
    #                             holdUntilDate="2016-03-05Z"/>
    #                      <SUBMISSION accession="ERA540869" alias="NGS_March_original2"/>
    #                      <MESSAGES>
    #                          <INFO>ADD action for the following XML: study.xml sample.xml
    #                          </INFO>
    #                      </MESSAGES>
    #                      <ACTIONS>ADD</ACTIONS>
    #                      <ACTIONS>ADD</ACTIONS>
    #                      <ACTIONS>ADD</ACTIONS>
    #                      <ACTIONS>ADD</ACTIONS>
    #                      <ACTIONS>HOLD</ACTIONS>
    #                  </RECEIPT>"""))
    #
    #     ena_submission_data = prepare_ena_data(
    #         submission=sub)
    #     ena_submission_data.pop('EXPERIMENT')
    #     ena_submission_data.pop('RUN')
    #     response, req_log_request_id = send_submission_to_ena(
    #         submission=sub,
    #         archive_access=conf.ena_server,
    #         ena_submission_data=ena_submission_data,
    #     )
    #     self.assertEqual(req_log_request_id, RequestLog.objects.get(
    #         request_id=req_log_request_id).request_id)
    #     self.assertEqual(200, response.status_code)
    #
    # def test_prepare_ena_data_add(self):
    #     sub = FullWorkflowTest._prepare()
    #     enalizer = Enalizer(submission=sub,
    #                         alias_postfix=sub.broker_submission_id)
    #     file_name, xml = enalizer.prepare_submission_xml_for_sending(
    #         action='ADD')
    #     self.assertIn('<ADD', xml)
    #
    # def test_prepare_ena_data_validate(self):
    #     sub = FullWorkflowTest._prepare()
    #     enalizer = Enalizer(submission=sub,
    #                         alias_postfix=sub.broker_submission_id)
    #     file_name, xml = enalizer.prepare_submission_xml_for_sending()
    #     self.assertIn('<VALIDATE', xml)
