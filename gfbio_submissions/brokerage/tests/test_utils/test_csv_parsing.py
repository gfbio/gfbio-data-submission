# -*- coding: utf-8 -*-
import os
from collections import OrderedDict
from pprint import pprint

from django.contrib.auth.models import Permission
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import ATAX, ENA, ENA_PANGAEA, GENERIC, GFBIO_HELPDESK_TICKET
from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path
from gfbio_submissions.brokerage.utils.csv import (
    check_csv_file_rule,
    check_for_molecular_content,
    check_for_submittable_data,
    check_metadata_rule,
    check_minimum_header_cols,
    extract_sample,
    parse_molecular_csv_with_encoding_detection,
)
from gfbio_submissions.brokerage.utils.ena import prepare_ena_data
from gfbio_submissions.brokerage.utils.schema_validation import validate_data_full
from gfbio_submissions.users.models import User
from ...models.broker_object import BrokerObject
from ...models.submission import Submission
from ...models.submission_upload import SubmissionUpload
from ...serializers.submission_serializer import SubmissionSerializer


class TestCSVParsing(TestCase):
    @classmethod
    def create_csv_submission_upload(cls, submission, user, file_sub_path="csv_files/molecular_metadata.csv"):
        with open(os.path.join(_get_test_data_dir_path(), file_sub_path), "rb") as data_file:
            return SubmissionUpload.objects.create(
                submission=submission,
                user=user,
                meta_data=True,
                file=SimpleUploadedFile(file_sub_path, data_file.read()),
            )

    @classmethod
    def _strip(cls, d):
        aliases = ["sample_alias", "experiment_alias", "sample_descriptor"]
        for k, v in d.items():
            if isinstance(v, list):
                for e in v:
                    cls._strip(e)
            elif isinstance(v, dict):
                cls._strip(v)
            else:
                if k in aliases:
                    d[k] = ""
        return d

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(username="horst", email="horst@horst.de", password="password")
        permissions = Permission.objects.filter(content_type__app_label="brokerage", codename__endswith="upload")
        user.user_permissions.add(*permissions)
        serializer = SubmissionSerializer(
            data={
                "target": "GENERIC",
                "release": True,
                "data": {
                    "requirements": {
                        "title": "Mol content test",
                        "description": "Reduced data for testing",
                        "data_center": "ENA – European Nucleotide Archive",
                    }
                },
            }
        )
        serializer.is_valid()
        cls.submission = serializer.save(user=user)
        cls.submission.additionalreference_set.create(type=GFBIO_HELPDESK_TICKET, reference_key="FAKE_KEY", primary=True)
        cls.create_csv_submission_upload(cls.submission, user)
        cls.expected_parse_result = {
            "experiments": [
                {
                    "design": {
                        "library_descriptor": {
                            "library_layout": {
                                "layout_type": "paired",
                                "nominal_length": 420,
                            },
                            "library_selection": "PCR",
                            "library_source": "METAGENOMIC",
                            "library_strategy": "AMPLICON",
                        },
                        "sample_descriptor": "oa2Xu",
                    },
                    "files": {
                        "forward_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1",
                        "forward_read_file_name": "File1.forward.fastq.gz",
                        "reverse_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1",
                        "reverse_read_file_name": "File1.reverse.fastq.gz",
                    },
                    "experiment_alias": "4aNiEu",
                    "platform": "Illumina HiSeq 1000",
                },
                {
                    "design": {
                        "library_descriptor": {
                            "library_layout": {
                                "layout_type": "paired",
                                "nominal_length": 420,
                            },
                            "library_selection": "PCR",
                            "library_source": "METAGENOMIC",
                            "library_strategy": "AMPLICON",
                        },
                        "sample_descriptor": "oaI2E-",
                    },
                    "files": {
                        "forward_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1",
                        "forward_read_file_name": "File2.forward.fastq.gz",
                        "reverse_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1",
                        "reverse_read_file_name": "File2.reverse.fastq.gz",
                    },
                    "experiment_alias": "ncs2E-",
                    "platform": "Illumina HiSeq 1000",
                },
                {
                    "design": {
                        "library_descriptor": {
                            "library_layout": {
                                "layout_type": "paired",
                                "nominal_length": 420,
                            },
                            "library_selection": "PCR",
                            "library_source": "METAGENOMIC",
                            "library_strategy": "AMPLICON",
                        },
                        "sample_descriptor": "ncnWEu",
                    },
                    "files": {
                        "forward_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1",
                        "forward_read_file_name": "File3.forward.fastq.gz",
                        "reverse_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1",
                        "reverse_read_file_name": "File3.reverse.fastq.gz",
                    },
                    "experiment_alias": "nNCgEu",
                    "platform": "Illumina HiSeq 1000",
                },
                {
                    "design": {
                        "library_descriptor": {
                            "library_layout": {
                                "layout_type": "paired",
                                "nominal_length": 420,
                            },
                            "library_selection": "PCR",
                            "library_source": "METAGENOMIC",
                            "library_strategy": "AMPLICON",
                        },
                        "sample_descriptor": "naXgPe",
                    },
                    "files": {
                        "forward_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1",
                        "forward_read_file_name": "File4.forward.fastq.gz",
                        "reverse_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1",
                        "reverse_read_file_name": "File4.reverse.fastq.gz",
                    },
                    "experiment_alias": "4NRiE-",
                    "platform": "Illumina HiSeq 1000",
                },
                {
                    "design": {
                        "library_descriptor": {
                            "library_layout": {
                                "layout_type": "paired",
                                "nominal_length": 420,
                            },
                            "library_selection": "PCR",
                            "library_source": "METAGENOMIC",
                            "library_strategy": "AMPLICON",
                        },
                        "sample_descriptor": "od_iEs",
                    },
                    "files": {
                        "forward_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1",
                        "forward_read_file_name": "File5.forward.fastq.gz",
                        "reverse_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1",
                        "reverse_read_file_name": "File5.reverse.fastq.gz",
                    },
                    "experiment_alias": "xdi2bs",
                    "platform": "Illumina HiSeq 1000",
                },
            ],
            "samples": [
                {
                    "sample_alias": "oa2Xu",
                    "sample_attributes": [
                        OrderedDict(
                            [
                                ("tag", "sample_description"),
                                ("value", "A description, with " "commmas, ..."),
                            ]
                        ),
                        OrderedDict([("tag", "investigation type"), ("value", "mimarks-survey")]),
                        OrderedDict([("tag", "environmental package"), ("value", "sediment")]),
                        OrderedDict([("tag", "collection date"), ("value", "2015-07-26")]),
                        OrderedDict(
                            [
                                ("tag", "geographic location (latitude)"),
                                ("value", "79.065100"),
                                ("units", "DD"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (longitude)"),
                                ("value", "4.1810000-0.5"),
                                ("units", "DD"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "depth"),
                                ("value", "0-0.5"),
                                ("units", "m"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (elevation)"),
                                ("value", "-2465.5"),
                                ("units", "m"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (country and/or sea)"),
                                ("value", "Atlantic Ocean"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "broad-scale environmental context"),
                                ("value", "marine benthic biome " "(ENVO:01000024)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "environmental medium"),
                                ("value", "marine sediment " "(ENVO:00002113)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "local environmental context"),
                                ("value", "marine benthic feature " "(ENVO:01000105)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "temperature"),
                                ("value", "33"),
                                ("units", "&#186;C"),
                            ]
                        ),
                    ],
                    "sample_description": "A description, with commmas, ...",
                    "sample_title": "Sample No. 1",
                    "taxon_id": 1234,
                },
                {
                    "sample_alias": "oaI2E-",
                    "sample_attributes": [
                        # TODO: this is no longer valid, since empty values are not added to attributes. GFBIO-2757
                        # OrderedDict([('tag',
                        #               'sample_description'),
                        #              ('value',
                        #               '')]),
                        OrderedDict([("tag", "investigation type"), ("value", "mimarks-survey")]),
                        OrderedDict([("tag", "environmental package"), ("value", "sediment")]),
                        OrderedDict([("tag", "collection date"), ("value", "2015-07-26")]),
                        OrderedDict(
                            [
                                ("tag", "geographic location (latitude)"),
                                ("value", "79.065100"),
                                ("units", "DD"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (longitude)"),
                                ("value", "4.1810000-0.5"),
                                ("units", "DD"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "depth"),
                                ("value", "0-0.5"),
                                ("units", "m"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (elevation)"),
                                ("value", "-2465.5"),
                                ("units", "m"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (country and/or sea)"),
                                ("value", "Atlantic Ocean"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "broad-scale environmental context"),
                                ("value", "marine benthic biome " "(ENVO:01000024)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "environmental medium"),
                                ("value", "marine sediment " "(ENVO:00002113)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "local environmental context"),
                                ("value", "marine benthic feature " "(ENVO:01000105)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "temperature"),
                                ("value", "2"),
                                ("units", "&#186;C"),
                            ]
                        ),
                    ],
                    "sample_description": "",
                    "sample_title": "Sample No. 2",
                    "taxon_id": 1234,
                },
                {
                    "sample_alias": "ncnWEu",
                    "sample_attributes": [
                        OrderedDict(
                            [
                                ("tag", "sample_description"),
                                ("value", "A description, with " "commmas, ..."),
                            ]
                        ),
                        OrderedDict([("tag", "investigation type"), ("value", "mimarks-survey")]),
                        OrderedDict([("tag", "environmental package"), ("value", "sediment")]),
                        OrderedDict([("tag", "collection date"), ("value", "2015-07-26")]),
                        OrderedDict(
                            [
                                ("tag", "geographic location (latitude)"),
                                ("value", "79.065100"),
                                ("units", "DD"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (longitude)"),
                                ("value", "4.1810000-0.5"),
                                ("units", "DD"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "depth"),
                                ("value", "0-0.5"),
                                ("units", "m"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (elevation)"),
                                ("value", "-2465.5"),
                                ("units", "m"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (country and/or sea)"),
                                ("value", "Atlantic Ocean"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "broad-scale environmental context"),
                                ("value", "marine benthic biome " "(ENVO:01000024)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "environmental medium"),
                                ("value", "marine sediment " "(ENVO:00002113)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "local environmental context"),
                                ("value", "marine benthic feature " "(ENVO:01000105)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "temperature"),
                                ("value", "33"),
                                ("units", "&#186;C"),
                            ]
                        ),
                    ],
                    "sample_description": "A description, with commmas, ...",
                    "sample_title": "Sample No. 3",
                    "taxon_id": 1234,
                },
                {
                    "sample_alias": "naXgPe",
                    "sample_attributes": [
                        OrderedDict(
                            [
                                ("tag", "sample_description"),
                                ("value", "A description, with " "commmas, ..."),
                            ]
                        ),
                        OrderedDict([("tag", "investigation type"), ("value", "mimarks-survey")]),
                        OrderedDict([("tag", "environmental package"), ("value", "sediment")]),
                        OrderedDict([("tag", "collection date"), ("value", "2015-07-26")]),
                        OrderedDict(
                            [
                                ("tag", "geographic location (latitude)"),
                                ("value", "79.065100"),
                                ("units", "DD"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (longitude)"),
                                ("value", "4.1810000-0.5"),
                                ("units", "DD"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "depth"),
                                ("value", "0-0.5"),
                                ("units", "m"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (elevation)"),
                                ("value", "-2465.5"),
                                ("units", "m"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (country and/or sea)"),
                                ("value", "Atlantic Ocean"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "broad-scale environmental context"),
                                ("value", "marine benthic biome " "(ENVO:01000024)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "environmental medium"),
                                ("value", "marine sediment " "(ENVO:00002113)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "local environmental context"),
                                ("value", "marine benthic feature " "(ENVO:01000105)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "temperature"),
                                ("value", "78"),
                                ("units", "&#186;C"),
                            ]
                        ),
                    ],
                    "sample_description": "A description, with commmas, ...",
                    "sample_title": "Sample No. 4",
                    "taxon_id": 1234,
                },
                {
                    "sample_alias": "od_iEs",
                    "sample_attributes": [
                        OrderedDict(
                            [
                                ("tag", "sample_description"),
                                ("value", "A description, with " "commmas, ..."),
                            ]
                        ),
                        OrderedDict([("tag", "investigation type"), ("value", "mimarks-survey")]),
                        OrderedDict([("tag", "environmental package"), ("value", "sediment")]),
                        OrderedDict([("tag", "collection date"), ("value", "2015-07-26")]),
                        OrderedDict(
                            [
                                ("tag", "geographic location (latitude)"),
                                ("value", "79.065100"),
                                ("units", "DD"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (longitude)"),
                                ("value", "4.1810000-0.5"),
                                ("units", "DD"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "depth"),
                                ("value", "0-0.5"),
                                ("units", "m"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (elevation)"),
                                ("value", "-2465.5"),
                                ("units", "m"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "geographic location (country and/or sea)"),
                                ("value", "Atlantic Ocean"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "broad-scale environmental context"),
                                ("value", "marine benthic biome " "(ENVO:01000024)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "environmental medium"),
                                ("value", "marine sediment " "(ENVO:00002113)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "local environmental context"),
                                ("value", "marine benthic feature " "(ENVO:01000105)"),
                            ]
                        ),
                        OrderedDict(
                            [
                                ("tag", "temperature"),
                                ("value", "1"),
                                ("units", "&#186;C"),
                            ]
                        ),
                    ],
                    "sample_description": "A description, with commmas, ...",
                    "sample_title": "Sample No. 5",
                    "taxon_id": 1234,
                },
            ],
            # 'study_type': 'Other'
        }
        cls._strip(cls.expected_parse_result)

    @classmethod
    def tearDownClass(cls):
        super(TestCSVParsing, cls).tearDownClass()
        # [
        #     shutil.rmtree(path="{0}{1}{2}".format(MEDIA_ROOT, os.sep, o), ignore_errors=False)
        #     for o in os.listdir(MEDIA_ROOT)
        # ]

    def test_extract_sample(self):
        row = OrderedDict(
            [
                ("sample_title", "PS99/41-9_S3"),
                ("taxon_id", "408172"),
                ("sample_description", "Sediment community in station S3"),
                ("sequencing_platform", "Illumina MiSeq"),
                ("library_strategy", "AMPLICON"),
                ("library_source", "METAGENOMIC"),
                ("library_selection", "PCR"),
                ("library_layout", "paired"),
                ("nominal_length", "400"),
                ("forward_read_file_name", "66_clip_R1.fastq"),
                ("forward_read_file_checksum", ""),
                ("reverse_read_file_name", "66_clip_R2.fastq"),
                ("reverse_read_file_checksum", ""),
                ("checksum_method", ""),
                ("investigation type", "mimarks-survey"),
                ("environmental package", "Sediment"),
                ("collection date", "2016-06-25"),
                ("geographic location (latitude)", "78.61N"),
                ("geographic location (longitude)", "5.04E"),
                ("depth", "0-1"),
                ("total depth of water column", "2338"),
                (
                    "geographic location (country and/or sea)",
                    "Arctic Ocean: Greenland Sea",
                ),
                ("broad-scale environmental context", "ENVO:00000426"),
                ("environmental medium", "ENVO:00002113"),
                ("local environmental context", "ENVO:01000007"),
            ]
        )
        field_names = [
            "sample_title",
            "taxon_id",
            "sample_description",
            "sequencing_platform",
            "library_strategy",
            "library_source",
            "library_selection",
            "library_layout",
            "nominal_length",
            "forward_read_file_name",
            "forward_read_file_checksum",
            "reverse_read_file_name",
            "reverse_read_file_checksum",
            "checksum_method",
            "investigation type",
            "environmental package",
            "collection date",
            "geographic location (latitude)",
            "geographic location (longitude)",
            "depth",
            "total depth of water column",
            "geographic location (country and/or sea)",
            "broad-scale environmental context",
            "environmental medium",
            "local environmental context",
        ]
        sample_id = "CeB9oY"
        expected_sample = {
            "sample_title": "PS99/41-9_S3",
            "sample_alias": "CeB9oY",
            "sample_description": "Sediment community in station S3",
            "taxon_id": 408172,
            "sample_attributes": [
                OrderedDict(
                    [
                        ("tag", "sample_description"),
                        ("value", "Sediment community in station S3"),
                    ]
                ),
                OrderedDict([("tag", "investigation type"), ("value", "mimarks-survey")]),
                OrderedDict([("tag", "environmental package"), ("value", "sediment")]),
                OrderedDict([("tag", "collection date"), ("value", "2016-06-25")]),
                OrderedDict(
                    [
                        ("tag", "geographic location (latitude)"),
                        ("value", "78.61N"),
                        ("units", "DD"),
                    ]
                ),
                OrderedDict(
                    [
                        ("tag", "geographic location (longitude)"),
                        ("value", "5.04E"),
                        ("units", "DD"),
                    ]
                ),
                OrderedDict(
                    [
                        ("tag", "depth"),
                        ("value", "0-1"),
                        ("units", "m"),
                    ]
                ),
                OrderedDict(
                    [
                        ("tag", "total depth of water column"),
                        ("value", "2338"),
                        ("units", "m"),
                    ]
                ),
                OrderedDict(
                    [
                        ("tag", "geographic location (country and/or sea)"),
                        ("value", "Arctic Ocean: Greenland Sea"),
                    ]
                ),
                OrderedDict([("tag", "broad-scale environmental context"), ("value", "ENVO:00000426")]),
                OrderedDict([("tag", "environmental medium"), ("value", "ENVO:00002113")]),
                OrderedDict([("tag", "local environmental context"), ("value", "ENVO:01000007")]),
            ],
        }
        sample, attributes_replaced = extract_sample(row=row, field_names=field_names, sample_id=sample_id)
        self.assertFalse(attributes_replaced)
        self.assertEqual(expected_sample, sample)

    def test_extract_sample_na_attributes(self):
        row = OrderedDict(
            [
                ("sample_title", "PS99/41-9_S3"),
                ("taxon_id", "408172"),
                ("sample_description", "Sediment community in station S3"),
                ("sequencing_platform", "Illumina MiSeq"),
                ("library_strategy", "AMPLICON"),
                ("library_source", "METAGENOMIC"),
                ("library_selection", "PCR"),
                ("library_layout", "paired"),
                ("nominal_length", "400"),
                ("forward_read_file_name", "66_clip_R1.fastq"),
                ("forward_read_file_checksum", ""),
                ("reverse_read_file_name", "66_clip_R2.fastq"),
                ("reverse_read_file_checksum", ""),
                ("checksum_method", ""),
                ("investigation type", "na"),  # no
                ("environmental package", "Sediment"),
                ("collection date", "2016-06-25"),
                ("geographic location (latitude)", "78.61N"),
                ("geographic location (longitude)", "5.04E"),
                ("depth", "NA"),  # no
                ("total depth of water column", "2338"),
                (
                    "geographic location (country and/or sea)",
                    "Arctic Ocean: Greenland Sea",
                ),
                ("broad-scale environmental context", "n/a"),  # no
                ("environmental medium", "ENVO:00002113"),
                ("local environmental context", "N/A"),
            ]
        )  # no
        field_names = [
            "sample_title",
            "taxon_id",
            "sample_description",
            "sequencing_platform",
            "library_strategy",
            "library_source",
            "library_selection",
            "library_layout",
            "nominal_length",
            "forward_read_file_name",
            "forward_read_file_checksum",
            "reverse_read_file_name",
            "reverse_read_file_checksum",
            "checksum_method",
            "investigation type",
            "environmental package",
            "collection date",
            "geographic location (latitude)",
            "geographic location (longitude)",
            "depth",
            "total depth of water column",
            "geographic location (country and/or sea)",
            "broad-scale environmental context",
            "environmental medium",
            "local environmental context",
        ]
        sample_id = "CeB9oY"
        expected_sample = {
            "sample_title": "PS99/41-9_S3",
            "sample_alias": "CeB9oY",
            "sample_description": "Sediment community in station S3",
            "taxon_id": 408172,
            "sample_attributes": [
                OrderedDict(
                    [
                        ("tag", "sample_description"),
                        ("value", "Sediment community in station S3"),
                    ]
                ),
                # OrderedDict([('tag', 'investigation type'),
                #              ('value', 'mimarks-survey')]),
                OrderedDict([("tag", "environmental package"), ("value", "sediment")]),
                OrderedDict([("tag", "collection date"), ("value", "2016-06-25")]),
                OrderedDict(
                    [
                        ("tag", "geographic location (latitude)"),
                        ("value", "78.61N"),
                        ("units", "DD"),
                    ]
                ),
                OrderedDict(
                    [
                        ("tag", "geographic location (longitude)"),
                        ("value", "5.04E"),
                        ("units", "DD"),
                    ]
                ),
                # OrderedDict(
                #     [('tag', 'geographic location ("depth")'), ('value', '0-1'),
                #      ('units', 'm')]),
                OrderedDict(
                    [
                        ("tag", "total depth of water column"),
                        ("value", "2338"),
                        ("units", "m"),
                    ]
                ),
                OrderedDict(
                    [
                        ("tag", "geographic location (country and/or sea)"),
                        ("value", "Arctic Ocean: Greenland Sea"),
                    ]
                ),
                # OrderedDict(
                #     [('tag', 'environment (biome)'),
                #      ('value', 'ENVO:00000426')]),
                OrderedDict([("tag", "environmental medium"), ("value", "ENVO:00002113")]),
                # OrderedDict(
                #     [('tag', 'environment (feature)'),
                #      ('value', 'ENVO:01000007')])
            ],
        }
        sample, attributes_replaced = extract_sample(row=row, field_names=field_names, sample_id=sample_id)
        self.assertEqual(expected_sample, sample)

    def test_parse_molecular_csv(self):
        file_names = [
            "csv_files/molecular_metadata.csv",
            "csv_files/mol_5_items_comma_some_double_quotes.csv",
            "csv_files/mol_5_items_comma_no_quoting_in_header.csv",
            "csv_files/mol_5_items_semi_no_quoting.csv",
            # 'csv_files/mol_comma_with_empty_rows_cols.csv',
        ]

        for fn in file_names:
            path = os.path.join(_get_test_data_dir_path(), fn)
            requirements = parse_molecular_csv_with_encoding_detection(path, submission=Submission.objects.first())
            requirements_keys = requirements.keys()
            self.assertIn("experiments", requirements_keys)
            self.assertIn("samples", requirements_keys)

    def test_parse_environmental_package(self):
        file_names = [
            "csv_files/fixed_DSUB_378.csv",
            "csv_files/molecular_metadata.csv",
            "csv_files/molecular_metadata_uppers.csv",
            "csv_files/GFBIO_submission_Illumina_HE533_18S_P20_new_utf8.csv",
            "csv_files/example_GFBIO_submission.csv",
            "csv_files/mol_5_items_comma_some_double_quotes.csv",
            "csv_files/mol_5_items_comma_no_quoting_in_header.csv",
            "csv_files/mol_5_items_semi_no_quoting.csv",
        ]

        for fn in file_names:
            path = os.path.join(_get_test_data_dir_path(), fn)
            requirements = parse_molecular_csv_with_encoding_detection(path, Submission.objects.first())

            requirements_keys = requirements.keys()
            self.assertIn("samples", requirements_keys)

            for x in range(0, len(requirements["samples"])):
                for s in requirements.get("samples", [{}])[x].get("sample_attributes", []):
                    tag = s.get("tag")
                    if "environmental package" in tag:
                        env_pack = s.get("value")
                        self.assertEqual(env_pack.islower(), True)

    def test_whitespaces_with_occasional_quotes(self):
        path = os.path.join(
            _get_test_data_dir_path(),
            "csv_files/molecular_metadata_white_spaces.csv",
        )
        requirements = parse_molecular_csv_with_encoding_detection(path, Submission.objects.first())
        self.assertEqual(
            "Sample No. 1",
            requirements.get("samples", [{}])[0].get("sample_title", "no value"),
        )
        taxon_id = requirements.get("samples", [{}])[0].get("taxon_id", "no value")
        self.assertEqual(1234, taxon_id)
        self.assertTrue(isinstance(taxon_id, int))
        self.assertEqual(
            "A description, with commmas, ...",
            requirements.get("samples", [{}])[0].get("sample_description", "no value"),
        )
        self.assertEqual(
            "Illumina HiSeq 1000",
            requirements.get("experiments", [{}])[0].get("platform"),
        )

        sample_attribute_tags = []
        geo_location = ""
        for s in requirements.get("samples", [{}])[0].get("sample_attributes", []):
            tag = s.get("tag")
            sample_attribute_tags.append(tag)
            if "geographic location (country and/or sea)" in tag:
                geo_location = s.get("value", "no location")

        self.assertIn("geographic location (country and/or sea)", sample_attribute_tags)
        self.assertEqual("Atlantic Ocean", geo_location)

        submission = Submission.objects.first()
        submission.data.get("requirements", {}).update(requirements)
        path = os.path.join(os.getcwd(), "gfbio_submissions/brokerage/schemas/ena_requirements.json")
        valid, full_errors = validate_data_full(
            data=submission.data,
            target=ENA_PANGAEA,
            schema_location=path,
        )
        self.assertTrue(valid)

    def test_whitespaces_all_double_quoted(self):
        path = os.path.join(
            _get_test_data_dir_path(),
            "csv_files/molecular_metadata_double_quoting_white_spaces.csv",
        )
        requirements = parse_molecular_csv_with_encoding_detection(path, Submission.objects.first())
        self.assertEqual(
            "Sample No. 1",
            requirements.get("samples", [{}])[0].get("sample_title", "no value"),
        )
        taxon_id = requirements.get("samples", [{}])[0].get("taxon_id", "no value")
        self.assertEqual(1234, taxon_id)
        self.assertTrue(isinstance(taxon_id, int))
        self.assertEqual(
            "A description, with commmas, ...",
            requirements.get("samples", [{}])[0].get("sample_description", "no value"),
        )
        self.assertEqual(
            "Illumina HiSeq 1000",
            requirements.get("experiments", [{}])[0].get("platform"),
        )

        sample_attribute_tags = []
        geo_location = ""
        for s in requirements.get("samples", [{}])[0].get("sample_attributes", []):
            tag = s.get("tag")
            sample_attribute_tags.append(tag)
            if "geographic location (country and/or sea)" in tag:
                geo_location = s.get("value", "no location")

        self.assertIn("geographic location (country and/or sea)", sample_attribute_tags)
        self.assertEqual("Atlantic Ocean", geo_location)

        submission = Submission.objects.first()
        submission.data.get("requirements", {}).update(requirements)
        path = os.path.join(os.getcwd(), "gfbio_submissions/brokerage/schemas/ena_requirements.json")
        valid, full_errors = validate_data_full(
            data=submission.data,
            target=ENA_PANGAEA,
            schema_location=path,
        )
        self.assertTrue(valid)

    def test_whitespaces_unquoted(self):
        path = os.path.join(
            _get_test_data_dir_path(),
            "csv_files/molecular_metadata_no_quoting_white_spaces.csv",
        )
        requirements = parse_molecular_csv_with_encoding_detection(path, Submission.objects.first())
        self.assertEqual(
            "Sample No. 1",
            requirements.get("samples", [{}])[0].get("sample_title", "no value"),
        )
        taxon_id = requirements.get("samples", [{}])[0].get("taxon_id", "no value")
        self.assertEqual(1234, taxon_id)
        self.assertTrue(isinstance(taxon_id, int))
        self.assertEqual(
            "A description, with commmas, ...",
            requirements.get("samples", [{}])[0].get("sample_description", "no value"),
        )
        self.assertEqual(
            "Illumina HiSeq 1000",
            requirements.get("experiments", [{}])[0].get("platform"),
        )

        sample_attribute_tags = []
        geo_location = ""
        for s in requirements.get("samples", [{}])[0].get("sample_attributes", []):
            tag = s.get("tag")
            sample_attribute_tags.append(tag)
            if "geographic location (country and/or sea)" in tag:
                geo_location = s.get("value", "no location")

        self.assertIn("geographic location (country and/or sea)", sample_attribute_tags)
        self.assertEqual("Atlantic Ocean", geo_location)

        submission = Submission.objects.first()
        submission.data.get("requirements", {}).update(requirements)
        path = os.path.join(os.getcwd(), "gfbio_submissions/brokerage/schemas/ena_requirements.json")
        valid, full_errors = validate_data_full(
            data=submission.data,
            target=ENA_PANGAEA,
            schema_location=path,
        )
        self.assertTrue(valid)

    def test_parse_comma_with_some_quotes(self):
        path = os.path.join(
            _get_test_data_dir_path(),
            "csv_files/mol_5_items_comma_some_double_quotes.csv",
        )
        requirements = parse_molecular_csv_with_encoding_detection(path, Submission.objects.first())
        requirements_keys = requirements.keys()
        self.assertIn("experiments", requirements_keys)
        self.assertIn("samples", requirements_keys)
        self.assertDictEqual(self.expected_parse_result, self._strip(requirements))

    def test_parse_comma_no_quotes_in_header(self):
        path = os.path.join(
            _get_test_data_dir_path(),
            "csv_files/mol_5_items_comma_no_quoting_in_header.csv",
        )
        requirements = parse_molecular_csv_with_encoding_detection(path, Submission.objects.first())
        requirements_keys = requirements.keys()
        self.assertIn("experiments", requirements_keys)
        self.assertIn("samples", requirements_keys)
        self.assertDictEqual(self.expected_parse_result, self._strip(requirements))

    def test_parse_comma_with_empty_rows(self):
        path = os.path.join(
            _get_test_data_dir_path(),
            "csv_files/mol_comma_with_empty_rows_cols.csv",
        )
        requirements = parse_molecular_csv_with_encoding_detection(path, Submission.objects.first())
        requirements_keys = requirements.keys()
        self.assertIn("experiments", requirements_keys)
        self.assertIn("samples", requirements_keys)
        # 8 rows: 1 empty, 1 only commas, rest is complete or partly empty
        # results in 6 items (as long as sample title available)
        self.assertEqual(6, len(requirements.get("samples", [])))
        self.assertEqual(6, len(requirements.get("experiments", [])))

    def test_parse_semi_no_quoting(self):
        path = os.path.join(_get_test_data_dir_path(), "csv_files/mol_5_items_semi_no_quoting.csv")
        requirements = parse_molecular_csv_with_encoding_detection(path, Submission.objects.first())
        requirements_keys = requirements.keys()
        self.assertIn("experiments", requirements_keys)
        self.assertIn("samples", requirements_keys)
        self.assertDictEqual(self.expected_parse_result, self._strip(requirements))

    def test_parse_semi_double_quoting(self):
        path = os.path.join(
            _get_test_data_dir_path(),
            "csv_files/mol_5_items_semi_double_quoting.csv",
        )
        requirements = parse_molecular_csv_with_encoding_detection(path, Submission.objects.first())
        requirements_keys = requirements.keys()
        self.assertIn("experiments", requirements_keys)
        self.assertIn("samples", requirements_keys)
        self.assertDictEqual(self.expected_parse_result, self._strip(requirements))

    def test_parse_real_world_example(self):
        path = os.path.join(
            _get_test_data_dir_path(),
            "csv_files/PS99_sediment_gfbio_submission_form.csv",
        )
        requirements = parse_molecular_csv_with_encoding_detection(path, Submission.objects.first())
        self.assertEqual(7, len(requirements["samples"]))
        self.assertEqual(7, len(requirements["experiments"]))

    def test_parse_xml_with_empty_mixs_values(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.save()

        self.create_csv_submission_upload(submission, User.objects.first(), "csv_files/SO45_missing_mixs_values.csv")

        is_mol_content, errors, check_performed = check_for_molecular_content(submission)
        self.assertTrue(is_mol_content)

        BrokerObject.objects.add_submission_data(submission)
        ena_submission_data = prepare_ena_data(submission=submission)
        fname, sxml = ena_submission_data["SAMPLE"]
        # Mixs parameter with unit mapping
        self.assertNotIn("geographic location (depth)", sxml)
        # Mixs parameter without unitmapping
        self.assertNotIn("geographic location (country and/or sea)", sxml)

        _, sxml = ena_submission_data["EXPERIMENT"]

    def test_parse_to_xml_real_world_single_layout(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.save()

        self.create_csv_submission_upload(submission, User.objects.first(), "csv_files/SO45_mod.csv")

        is_mol_content, errors, check_performed = check_for_molecular_content(submission)
        self.assertTrue(is_mol_content)

        BrokerObject.objects.add_submission_data(submission)
        ena_submission_data = prepare_ena_data(submission=submission)

        file_name, file_content = ena_submission_data["RUN"]
        self.assertEqual(
            4,
            file_content.count('filename="{0}'.format(submission.broker_submission_id)),
        )

        file_name, file_content = ena_submission_data["EXPERIMENT"]
        self.assertEqual(4, file_content.count("<LIBRARY_LAYOUT><SINGLE /></LIBRARY_LAYOUT>"))
        self.assertNotIn("<LIBRARY_LAYOUT><PAIRED", file_content)

    def test_check_for_mol_content_case_sensitivity(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.save()

        self.create_csv_submission_upload(submission, User.objects.first(), "csv_files/SO45_mixed_cases.csv")
        is_mol_content, errors, check_performed = check_for_molecular_content(submission)
        self.assertTrue(is_mol_content)
        self.assertListEqual([], errors)

    def test_check_for_molecular_content_comma_sep(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.save()
        self.create_csv_submission_upload(submission, User.objects.first(), "csv_files/dsub-269_template.csv")

        is_mol_content, errors, check_performed = check_for_molecular_content(submission)
        self.assertTrue(is_mol_content)
        BrokerObject.objects.add_submission_data(submission)
        self.assertEqual(25, len(BrokerObject.objects.filter(type="experiment")))
        self.assertEqual(
            len(BrokerObject.objects.filter(type="experiment")),
            len(BrokerObject.objects.filter(type="run")),
        )

    def test_parse_tab(self):
        self.maxDiff = None
        path = os.path.join(_get_test_data_dir_path(), "csv_files/mol_5_items_tab.csv")
        requirements = parse_molecular_csv_with_encoding_detection(path, Submission.objects.first())
        requirements_keys = requirements.keys()
        self.assertIn("experiments", requirements_keys)
        self.assertIn("samples", requirements_keys)
        self.assertDictEqual(self.expected_parse_result, self._strip(requirements))

    def test_parse_with_bom(self):
        test_files = [
            os.path.join(_get_test_data_dir_path(), "csv_files/GFBIO_submission_with_UTF8-bom.csv"),
            os.path.join(_get_test_data_dir_path(), "csv_files/GFBIO_submission_with_UTF16-BE.csv"),
            os.path.join(_get_test_data_dir_path(), "csv_files/GFBIO_submission_with_UTF16-LE.csv"),
            os.path.join(_get_test_data_dir_path(), "csv_files/GFBIO_submission_with_UTF8_no_BOM.csv")
        ]
        for path in test_files:
            requirements = parse_molecular_csv_with_encoding_detection(path, Submission.objects.first())

            assert "samples" in requirements
            assert len(requirements["samples"]) == 1

    def test_check_for_molecular_content(self):
        submission = Submission.objects.first()
        self.assertEqual(GENERIC, submission.target)
        self.assertIn("data_center", submission.data["requirements"].keys())
        self.assertEqual(
            "ENA – European Nucleotide Archive",
            submission.data["requirements"]["data_center"],
        )
        self.assertNotIn("samples", submission.data["requirements"].keys())
        self.assertNotIn("experiments", submission.data["requirements"].keys())

        is_mol_content, errors, check_performed = check_for_molecular_content(submission)

        self.assertTrue(is_mol_content)
        self.assertListEqual([], errors)
        submission = Submission.objects.first()
        self.assertIn("samples", submission.data["requirements"].keys())
        self.assertIn("experiments", submission.data["requirements"].keys())
        self.assertEqual(ENA, submission.target)

    def test_check_content_on_submission_with_molecular_data(self):
        submission = Submission.objects.first()
        is_mol_content, errors, check_performed = check_for_molecular_content(submission)
        submission = Submission.objects.first()
        self.assertTrue(is_mol_content)
        self.assertTrue(check_performed)
        self.assertIn("samples", submission.data["requirements"].keys())
        self.assertIn("experiments", submission.data["requirements"].keys())

        previous_length = len(submission.data.get("requirements", {}).get("experiments", []))
        is_mol_content, errors, check_performed = check_for_molecular_content(submission)
        self.assertTrue(is_mol_content)
        self.assertTrue(check_performed)
        submission = Submission.objects.first()
        current_length = len(submission.data.get("requirements", {}).get("experiments", []))

        self.assertEqual(previous_length, current_length)

    def test_same_sample_title(self):
        # if multiple rows contain the same sample_title, it is expected that
        # no additional sample is added, just an experiment with reference
        # to the already existing sample (one-sample to many-experiments)
        with open(
            os.path.join(
                _get_test_data_dir_path(),
                "csv_files/mol_5_items_semi_double_quoting.csv",
            ),
            "r", encoding='utf-8-sig'
        ):
            submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.save()

        self.create_csv_submission_upload(submission, User.objects.first(), "csv_files/Data_submission_SAGs.csv")
        is_mol_content, errors, check_performed = check_for_molecular_content(submission)
        self.assertTrue(is_mol_content)
        samples = submission.data.get("requirements", {}).get("samples", [])
        self.assertEqual(1, len(samples))
        experiments = submission.data.get("requirements", {}).get("experiments", [])
        self.assertEqual(7, len(experiments))

    def test_check_minimum_header_cols(self):
        submission = Submission.objects.first()
        self.assertEqual(1, len(submission.submissionupload_set.filter(file__endswith=".csv")))
        self.assertTrue(
            check_minimum_header_cols(submission.submissionupload_set.filter(file__endswith=".csv").first())
        )

    def test_check_minimum_header_cols_fail(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        SimpleUploadedFile("test_submission_upload.tsv", b"these\tare\tthe\tfile\tcontents")
        SubmissionUpload.objects.create(
            submission=submission,
            user=submission.user,
            meta_data=True,
            file=SimpleUploadedFile("test_submission_upload.csv", b"sample_title;NO_DESCR;the;file;contents"),
        )
        self.assertEqual(1, len(submission.submissionupload_set.filter(file__endswith=".csv")))
        self.assertFalse(
            check_minimum_header_cols(submission.submissionupload_set.filter(file__endswith=".csv").first())
        )

    def test_check_metadata_rule(self):
        submission = Submission.objects.first()
        self.assertTrue(check_metadata_rule(submission))

    def test_check_metadata_rule_multiple_csvs(self):
        submission = Submission.objects.first()
        SubmissionUpload.objects.create(
            submission=submission,
            user=submission.user,
            meta_data=True,
            file=SimpleUploadedFile("test_submission_upload.csv", b"sample_title;NO_DESCR;the;file;contents"),
        )
        self.assertEqual(2, len(submission.submissionupload_set.filter(file__endswith=".csv")))
        self.assertFalse(check_metadata_rule(submission))

    def test_check_csv_file_rule(self):
        submission = Submission.objects.first()
        self.assertTrue(check_csv_file_rule(submission))

    def test_check_csv_file_rule_multiple_csvs(self):
        submission = Submission.objects.first()
        upload = submission.submissionupload_set.first()
        upload.meta_data = False
        upload.save()
        SubmissionUpload.objects.create(
            submission=submission,
            user=submission.user,
            meta_data=False,
            file=SimpleUploadedFile("test_submission_upload.csv", b"sample_title;NO_DESCR;the;file;contents"),
        )
        self.assertEqual(2, len(submission.submissionupload_set.filter(file__endswith=".csv")))
        self.assertTrue(check_csv_file_rule(submission))

    # # TODO: remove ?
    # def test_check_content_metadata_rules(self):
    #     # TEMPLATE_HEADER = '"sample_title";"taxon_id";"sample_description";"sequencing_platform";"library_strategy";"library_source";"library_selection";"library_layout";"nominal_length";"forward_read_file_name";"forward_read_file_checksum";"reverse_read_file_name";"reverse_read_file_checksum";"checksum_method";"investigation type";"environmental package";"collection date";"geographic location (latitude)";"geographic location (longitude)";"depth";"geographic location (elevation)";"geographic location (country and/or sea)";"broad-scale environmental context";"environmental medium";"local environmental context";"project name";"geographic location (region and locality)";"total depth of water column"'
    #     # template_cols = TEMPLATE_HEADER.replace('"', '').split(';')
    #     # print(template_cols)
    #     # print(len(template_cols))
    #
    #     submission = Submission.objects.first()
    #     self.assertEqual(GENERIC, submission.target)
    #     upload = submission.submissionupload_set.first()
    #     pprint(upload.__dict__)
    #     csv_uploads = submission.submissionupload_set.filter(
    #         file__endswith='.csv')
    #     # pprint(csv_uploads)
    #     # print(csv_uploads.first().file)
    #     print(check_metadata_rule(submission))
    #     print(check_csv_file_rule(submission))
    #     # with open(upload.file.path, 'r') as file:
    #     #     line = file.readline()
    #     #     print(line)
    #     #     print(csv.Sniffer().has_header(line))
    #     #     dialect = csv.Sniffer().sniff(smart_text(line))
    #     #     delimiter = dialect.delimiter if dialect.delimiter in [',', ';',
    #     #                                                            '\t'] else ';'
    #     #     print(dialect)
    #     #     print(delimiter)
    #     #     s = line.replace('"', '').split(delimiter)
    #     #     print(collections.Counter(s))
    #     #     print(collections.Counter(SUBMISSION_MIN_COLS))
    #     #     print(SUBMISSION_MIN_COLS in s)
    #     #
    #     #     res = {c in s for c in SUBMISSION_MIN_COLS}
    #     #     print(res)
    #     #     print(type(res))
    #     #     if len(res) == 1 and (True in res):
    #     #         print('CHECK')
    #     #     else:
    #     #         print('FAIL')
    #
    #     # with open('no_csv', 'w') as file:
    #     #     file.writelines(['hdlihglhvkhvd\n', 'isdb ibduab sdb ouub\n'])
    #     #
    #     # with open('no_csv', 'r') as file:
    #     #     line = file.readline()
    #     #     # print(line)
    #     #     # print(csv.Sniffer().has_header(xfile.read()))
    #     #     dialect = csv.Sniffer().sniff(smart_text(line))
    #     #     delimiter = dialect.delimiter if dialect.delimiter in [',', ';',
    #     #                                                            '\t'] else ';'
    #     #     print(dialect)
    #     #     print(delimiter)
    #     #
    #     # TODO: defaults to ; ok ! split to delim and do list comparision. done ...

    # test check for submittable molecular data
    def test_check_for_submittable_molecular_data(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.target = ENA
        submission.save()

        self.create_csv_submission_upload(submission, User.objects.first(), "csv_files/dsub-269_template.csv")
        status, messages, check_performed = check_for_submittable_data(submission)
        self.assertTrue(status)
        self.assertEqual([], messages)
        self.assertTrue(check_performed)

    # test check for submittable molecular data fail
    def test_check_for_submittable_molecular_data_fail(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.target = ENA
        submission.save()

        self.create_csv_submission_upload(submission, User.objects.first(), "csv_files/molecular_metadata.csv")
        status, messages, check_performed = check_for_submittable_data(submission)
        self.assertFalse(status)
        self.assertEqual(["Data with the following taxon ids is not submittable:", "1234"], messages)
        self.assertTrue(check_performed)

    # test check for submittable atax data valid
    def test_check_for_submittable_atax_data_valid(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.target = ATAX
        submission.save()

        self.create_csv_submission_upload(
            submission, User.objects.first(), "csv_files/specimen_table_Platypelis_valid.csv"
        )
        status, messages, check_performed = check_for_submittable_data(submission)
        self.assertTrue(status)
        self.assertEqual([], messages)
        self.assertTrue(check_performed)

    # test check for submittable atax data fail
    def test_check_for_submittable_atax_data_fail(self):
        submission = Submission.objects.first()
        submission.submissionupload_set.all().delete()
        submission.target = ATAX
        submission.save()

        self.create_csv_submission_upload(
            submission, User.objects.first(), "csv_files/specimen_table_Platypelis_wrong_sc_name.csv"
        )
        status, messages, check_performed = check_for_submittable_data(submission)
        self.assertFalse(status)
        self.assertEqual(
            [
                "Data with the following scientific names is not submittable:",
                "Platypelis tsaratananaensissis",
            ],
            messages,
        )
        self.assertTrue(check_performed)
