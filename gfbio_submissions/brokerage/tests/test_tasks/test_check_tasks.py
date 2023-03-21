# -*- coding: utf-8 -*-
from unittest import skip

from django.db.models import Q
from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import ENA, ATAX
from gfbio_submissions.brokerage.models import Submission, AdditionalReference, \
    TaskProgressReport
from gfbio_submissions.brokerage.tasks import \
    check_for_submissions_without_helpdesk_issue_task, \
    check_for_user_without_site_configuration_task
from gfbio_submissions.brokerage.utils.schema_validation import \
    validate_data_full
from gfbio_submissions.generic.configuration.settings import HOSTING_SITE
from gfbio_submissions.generic.models import ResourceCredential, \
    SiteConfiguration
from gfbio_submissions.users.models import User
import os
import xmlschema
from lxml import etree
import xml.etree.ElementTree as ET
from gfbio_submissions.brokerage.tests.utils import \
    _get_test_data_dir_path

class TestCheckTasks(TestCase):

    @classmethod
    def setUpTestData(cls):
        user1 = User.objects.create(
            username='user1'
        )
        user2 = User.objects.create(
            username='user2'
        )
        user3 = User.objects.create(
            username='user3'
        )

        # submission with primary helpdesk ticket
        submission = Submission.objects.create(
            user=user1,
            status=Submission.OPEN,
            target=ENA,
            data={'has': 'primary helpdeskticket and pangaea ticket'}
        )
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='HLP-01',
            primary=True
        )
        submission.additionalreference_set.create(
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
            reference_key='PNG-0x',
            primary=False
        )
        # submission with no primary helpdesk ticket, but CANCELLED
        submission = Submission.objects.create(
            user=user1,
            status=Submission.CANCELLED,
            target=ENA,
            data={'has': 'primary helpdeskticket and pangaea ticket'}
        )

        # submission with helpdesk ticket, which is not primary
        submission = Submission.objects.create(
            user=user2,
            status=Submission.OPEN,
            target=ENA,
            data={'has': 'non-primary helpdeskticket and no pangaea ticket'}
        )
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='HLP-02',
            primary=False
        )

        # submission with primary ticket that is no of type helpdesk
        submission = Submission.objects.create(
            user=user1,
            status=Submission.OPEN,
            target=ENA,
            data={'has': 'primary non-helpdesk ticket'}
        )
        submission.additionalreference_set.create(
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
            reference_key='PNG-0x2',
            primary=True
        )

        # submission with no tickets at all
        submission = Submission.objects.create(
            user=user2,
            status=Submission.OPEN,
            target=ENA,
            data={'has': 'no tickets at all'}
        )

        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )

        site_conf = SiteConfiguration.objects.create(
            title=HOSTING_SITE,
            ena_server=resource_cred,
            ena_report_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
            contact='kevin@horstmeier.de'
        )
        user1.site_configuration = site_conf
        user1.is_user = True
        user1.is_site = False
        user1.save()
        user2.site_configuration = None
        user2.is_user = True
        user2.is_site = False
        user2.save()

    def rename_keys(self, iterable):
        if type(iterable) is dict:
            for key in iterable.copy().keys():
                iterable[key.strip()] = iterable.pop(key)
                if type(iterable[key.strip()]) is dict or type(iterable[key.strip()]) is list:
                    iterable[key.strip()] = self.rename_keys(iterable[key.strip()])
        elif type(iterable) is list:
            for item in iterable:
                item = self.rename_keys(item)
        return iterable

    def test_db_content(self):
        submissions = Submission.objects.all()
        self.assertEqual(5, len(submissions))
        references = AdditionalReference.objects.all()
        self.assertEqual(4, len(references))

        no_ticket_subs_1 = Submission.objects.exclude(
            additionalreference__in=AdditionalReference.objects.filter(
                primary=True,
                type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            )
        )
        self.assertEqual(4, len(no_ticket_subs_1))

        no_ticket_subs_2 = Submission.objects.exclude(
            Q(additionalreference__primary=True) & Q(
                additionalreference__type='0')
        )
        self.assertEqual(4, len(no_ticket_subs_2))

        no_ticket_subs_3 = Submission.objects.get_submissions_without_primary_helpdesk_issue()
        self.assertEqual(3, len(no_ticket_subs_3))

    def test_check_for_submissions_without_helpdesk_issue_task(self):
        result = check_for_submissions_without_helpdesk_issue_task.apply()
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        self.assertTrue(result.successful())

    def test_check_for_user_without_site_configuration_task(self):
        users = User.objects.all()
        self.assertEqual(3, len(users))
        self.assertEqual(2, len(users.filter(site_configuration=None)))
        result = check_for_user_without_site_configuration_task.apply()
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        self.assertTrue(result.successful())
        self.assertEqual(0, len(User.objects.filter(site_configuration=None)))


    # @skip("currently unused feature")
    def test_validate_atax_json(self):
        data = {
            'requirements': {
                'title': 'atax submission',
                'description': 'atax sub Description',
                'atax_specimens':
                    [
                        {
                            'UnitID': 'ZSM 5652/2012',
                            'RecordBasis': 'Preserved Specimen',
                            'FullScientificNameString': 'Platypelis laetus'
                        },
                        {
                            'UnitID': 'ZSM 5651/2012',
                            'RecordBasis': 'Preserved Specimen',
                            'FullScientificNameString': 'Platypelis laetus'
                        },
                        {
                            'UnitID': 'ZSM 5653/2012',
                            'RecordBasis': 'Preserved Specimen',
                            'FullScientificNameString': 'Platypelis laetus'
                        }
                    ]
                }
            }

        # to lower case and strip for all keys:
        # only strip the keys, abcd mapped keywords are necessary
        clean_data = self.rename_keys(data)

        valid, errors = validate_data_full(clean_data, ATAX, None)
        self.assertTrue(valid)

    #@skip("currently unused feature")
    def test_validate_atax_json_with_spaces(self):
        data = {
            'requirements': {
                'title': 'atax submission',
                'description': 'atax sub Description',
                'atax_specimens':
                    [
                        {
                            '  UnitID': 'ZSM 5652/2012',
                            'RecordBasis': 'Preserved Specimen',
                            'FullScientificNameString': 'Platypelis laetus'
                        },
                        {
                            'UnitID': 'ZSM 5651/2012',
                            'RecordBasis  ': 'Preserved Specimen',
                            'FullScientificNameString': 'Platypelis laetus'
                        },
                        {
                            'UnitID': 'ZSM 5653/2012',
                            'RecordBasis': 'Preserved Specimen',
                            ' FullScientificNameString ': 'Platypelis laetus'
                        }
                    ]
                }
            }

        # to lower case and strip for all keys:
        clean_data = self.rename_keys(data)

        valid, errors = validate_data_full(clean_data, ATAX, None)
        self.assertTrue(valid)

    #@skip("currently unused feature")
    def test_validate_atax_json_invalid_value(self):
        data = {
            'requirements': {
                'title': 'atax submission',
                'description': 'atax sub Description',
                'atax_specimens':
                    [
                        {
                            'UnitID': 5652,
                            'RecordBasis': 'Preserved Specimen',
                            'FullScientificNameString': 'Platypelis laetus'
                        },
                        {
                            'UnitID': 'ZSM 5651/2012',
                            'RecordBasis': 'Preserved Specimen',
                            'FullScientificNameString': 'Platypelis laetus'
                        },
                        {
                            'UnitID': 'ZSM 5653/2012',
                            'RecordBasis': 'Preserved Specimen',
                            'FullScientificNameString': 'Platypelis laetus'
                        }
                    ]
                }
            }

        # to lower case and strip for all keys:
        clean_data = self.rename_keys(data)

        valid, errors = validate_data_full(clean_data, ATAX, None)
        self.assertFalse(valid)

        self.assertEqual(1, len(errors))
        self.assertIn("UnitID : 5652 is not of type 'string'", errors[0])

    # Staatliche Naturwissenschaftliche Sammlungen Bayerns
    def test_validate_Natural_Science_Collections_file_against_abcd_xml(self):

        schema = xmlschema.XMLSchema(os.path.join(
                    _get_test_data_dir_path(),
                    'xml_files/ABCD_2.06.XSD'))

        valid = schema.is_valid(os.path.join(
                    _get_test_data_dir_path(),
                    'xml_files/SNSB_Mimophis.xml'))
        self.assertTrue(valid)

    # Biocase, Botanischer Garten Berlin
    def test_validate_Biocase_Botanical_Garden_file_against_abcd_xml(self):

        schema = xmlschema.XMLSchema(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/ABCD_2.06.XSD'))

        valid = schema.is_valid(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/Desmidiaceae_biocase.xml'))
        self.assertTrue(valid)

    # Staatliche Naturwissenschaftliche Sammlungen Bayerns
    def test_validate_Natural_Science_Collections_single_case_against_abcd_xml(self):

        schema = xmlschema.XMLSchema(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/ABCD_2.06.XSD'))

        valid = schema.is_valid(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/SNSB_Mimophis_single.xml'))
        self.assertTrue(valid)

    #xml with own Vences data (subset):
    def test_Vences_specimen_xml_against_abcd_xml(self):

        schema = xmlschema.XMLSchema(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/ABCD_2.06.XSD'))

        valid = schema.is_valid(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/TAX_ABCD_example.xml'))
        self.assertTrue(valid)

    # @skip('For development tests')
    def test_Vences_specimen_xml_against_abcd_extended_xml(self):

        schema = xmlschema.XMLSchema(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/ABCD_2.06.XSD'))
        try:
            valid = schema.is_valid(os.path.join(
                _get_test_data_dir_path(),
                'xml_files/TAX_ABCD_example_draft.xml'))
        except ET.ParseError as parse_error:
            self.assertIn('not well-formed (invalid token): line 1, column 0', parse_error.__repr__())

        self.assertTrue(valid)

    def test_self_generated_specimen_xml_against_abcd_schemal(self):

        schema = xmlschema.XMLSchema(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/ABCD_2.06.XSD'))
        try:
            valid = schema.is_valid(os.path.join(
                _get_test_data_dir_path(),
                'xml_files/specimen_table_Platypelis.xml'))
        except ET.ParseError as parse_error:
            self.assertIn('not well-formed (invalid token): line 1, column 0', parse_error.__repr__())

        self.assertTrue(valid)

    # @skip('For development tests')
    def test_self_generated_specimen_xml_with_gaps_against_abcd_schemal(self):

        schema = xmlschema.XMLSchema(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/ABCD_2.06.XSD'))
        try:
            valid = schema.is_valid(os.path.join(
                _get_test_data_dir_path(),
                'xml_files/specimen_table_Platypelis_with_gaps.xml'))
        except ET.ParseError as parse_error:
            self.assertIn('not well-formed (invalid token): line 1, column 0', parse_error.__repr__())

        self.assertTrue(valid)

    # xml with own Vences data (subset), file extension pdf, but does not matter:
    def test_Vences_specimen_pdf_against_abcd_xml(self):

        schema = xmlschema.XMLSchema(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/ABCD_2.06.XSD'))

        valid = schema.is_valid(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/TAX_ABCD_example.pdf'))
        self.assertTrue(valid)

    #no xml file at all (but json)
    def test_not_xml_file_against_abcd_xml(self):

        schema = xmlschema.XMLSchema(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/ABCD_2.06.XSD'))
        try:
            schema.validate(
                os.path.join(
                    _get_test_data_dir_path(),
                    'xml_files/atax_specimen_definitions_min.json'))
        except ET.ParseError as parse_error:
            self.assertIn('not well-formed (invalid token): line 1, column 0', parse_error.__repr__())

    #RecordBasis (Field for Taxonomics) not from the given selection
    def test_wrong_xml_values_against_abcd_xml(self):

        schema = xmlschema.XMLSchema(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/ABCD_2.06.XSD'))

        valid = schema.is_valid(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/TAX_ABCD_example_wrong_RecordBasis.xml'))
        self.assertFalse(valid)

    #special ParseError, tag not closed:
    def test_xml_tag_not_closed_against_abcd_xml(self):

        schema = xmlschema.XMLSchema(os.path.join(
            _get_test_data_dir_path(),
            'xml_files/ABCD_2.06.XSD'))
        try:
            schema.validate(
                os.path.join(
                    _get_test_data_dir_path(),
                    'xml_files/TAX_ABCD_example_tag_not_closed.xml'))
        except ET.ParseError as parse_error:
            self.assertIn('mismatched tag', parse_error.__repr__())

