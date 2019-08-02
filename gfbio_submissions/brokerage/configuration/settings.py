# -*- coding: utf-8 -*-
from _csv import QUOTE_NONNUMERIC, QUOTE_NONE

settings = {}

BASE_HOST_NAME = getattr(
    settings,
    'BASE_HOST_NAME',
    'submission.gfbio.org'
)

BASIC_TYPE = getattr(
    settings,
    'BASIC_TYPE',
    {'type': 'string', 'minLength': 1}
)

# TODO: check usage and find out if obsolete
# GCDJ -> ENA ?
CHECKLIST_ACCESSION_MAPPING = getattr(
    settings,
    'CHECKLIST_ACCESSION_MAPPING',
    {
        'human oral': 'ERC000016',
        'microbial mat biolfilm': 'ERC000019',
        'human vaginal': 'ERC000018',
        'water': 'ERC000024',
        'sediment': 'ERC000021',
        'host associated': 'ERC000013',
        'built environment': 'ERC000031',
        'miscellaneous natural or artificial environment': 'ERC000025',
        'air': 'ERC000012',
        'human skin': 'ERC000017',
        'human associated': 'ERC000014',
        'plant associated': 'ERC000020',
        'wastewater sludge': 'ERC000023',
        'soil': 'ERC000022',
        'human gut': 'ERC000015'
    }
)

CSV_WRITER_QUOTING = getattr(
    settings,
    'CSV_WRITER_QUOTING',
    QUOTE_NONNUMERIC
)

CSV_READER_QUOTING = getattr(
    settings,
    'CSV_READER_QUOTING',
    QUOTE_NONE
)

DRAFT04_VALIDATORS = getattr(
    settings,
    'DRAFT04_VALIDATORS',
    [
        '$ref',
        'additionalItems',
        'additionalProperties',
        'dependencies',
        'disallow',
        'divisibleBy',
        'enum',
        'extends',
        'format',
        'items',
        'maxItems',
        'maxLength',
        'maximum',
        'minItems',
        'minLength',
        'minimum',
        'multipleOf',
        'pattern',
        'patternProperties',
        'properties',
        'type',
        'uniqueItems',
    ]
)

ENA = getattr(
    settings,
    'ENA',
    'ENA'
)

DEFAULT_ENA_BROKER_NAME = getattr(
    settings,
    'DEFAULT_ENA_BROKER_NAME',
    'GFBIO'
)

DEFAULT_ENA_CENTER_NAME = getattr(
    settings,
    'DEFAULT_ENA_CENTER_NAME',
    '_NO_CENTER_NAME_SET_'
)

ENA_PANGAEA = getattr(
    settings,
    'ENA_PANGAEA',
    'ENA_PANGAEA'
)

GENERIC = getattr(
    settings,
    'GENERIC',
    'GENERIC'
)

HELPDESK_API_SUB_URL = getattr(
    settings,
    'HELPDESK_API_SUB_URL',
    '/rest/api/2/issue'
)

HELPDESK_COMMENT_SUB_URL = getattr(
    settings,
    'HELPDESK_COMMENT_SUB_URL',
    'comment'
)

HELPDESK_API_ATTACHMENT_URL = getattr(
    settings,
    'HELPDESK_API_ATTACHMENT_URL',
    '/rest/api/2/attachment'
)

HELPDESK_ATTACHMENT_SUB_URL = getattr(
    settings,
    'HELPDESK_ATTACHMENT_SUB_URL',
    'attachments'
)

HELPDESK_LICENSE_MAPPINGS = getattr(
    settings,
    'HELPDESK_LICENSE_MAPPINGS',
    {
        'CC0 1.0': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10197',
            'value': 'CC0',
            'id': '10197'
        },
        'CC BY 4.0': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10800',
            'value': 'CC BY 4.0',
            'id': '10800'
        },
        'CC BY NC 4.0': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10801',
            'value': 'CC BY-NC 4.0',
            'id': '10801'
        },
        'CC BY-NC-ND 4.0': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10805',
            'value': 'CC BY-NC-ND 4.0',
            'id': '10805'
        },
        'CC BY-NC-SA 4.0': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10804',
            'value': 'CC BY-NC-SA 4.0',
            'id': '10804'
        },
        'CC BY-ND 4.0': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10803',
            'value': 'CC BY-ND 4.0',
            'id': '10803'
        },
        'CC BY-SA 4.0': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10802',
            'value': 'CC BY-SA 4.0',
            'id': '10802'
        },
        'Other License': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10500',
            'value': 'other',
            'id': '10500'
        }
    }
)

HELPDESK_METASCHEMA_MAPPINGS = getattr(
    settings,
    'HELPDESK_METASCHEMA_MAPPINGS',
    {
        'ABCD 2.06': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10204',
            'value': 'ABCD',
            'id': '10204'
        },
        'DwC 2013-10-25': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10149',
            'value': 'Darwin Core',
            'id': '10149'
        },
        'DC 1.1': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10183',
            'value': 'Dublin Core',
            'id': '10183'
        },
        'EDM 5.2.3': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10184',
            'value': 'EDM',
            'id': '10184'
        },
        'EML 2.1.1': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10150',
            'value': 'EML',
            'id': '10150'
        },
        'ESE 3.4.1': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10185',
            'value': 'ESE',
            'id': '10185'
        },
        'INSPIRE Directive 2007/2/EC': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10186',
            'value': 'INSPIRE',
            'id': '10186'
        },
        'ISO 19115-1 2014': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10151',
            'value': 'ISO 19115',
            'id': '10151'
        },
        'MIxS 4.0': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10152',
            'value': 'MIxS',
            'id': '10152'
        },
        'Other metadata or documentation': {
            'self': 'https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10300',
            'value': 'other',
            'id': '10300'
        }
    }
)

# datacenter jira user mappings
# https://gfbio.biowikifarm.net/internal/Data_Centers_Contact_Persons
# TODO: always sync with list of valid datacenter values in json-schema file
HELPDESK_DATACENTER_USER_MAPPINGS = getattr(
    settings,
    'HELPDESK_DATACENTER_USER_MAPPINGS',
    {
        # default/no user: 'GFBio Data Centers - our curators will suggest the appropriate one(s)': '',
        'ENA – European Nucleotide Archive': 'ikostadi',
        'PANGAEA – Data Publisher for Earth & Environmental Science': 'pangaea',
        'BGBM – Botanic Garden and Botanical Museum Berlin, Freie Universität Berlin': 'bgbm',
        'DSMZ – Leibniz Institute DSMZ – German Collection of Microorganisms and Cell Cultures, Braunschweig': 'dsmz',
        'MfN – Leibniz Institute for Research on Evolution and Biodiversity, Berlin': 'mfn',
        'SGN – Senckenberg Gesellschaft für Naturforschung – Leibniz Institute, Frankfurt': 'sgn',
        'SMNS – State Museum of Natural History Stuttgart': 'smns',
        'SNSB – Staatliche Naturwissenschaftliche Sammlungen Bayerns – SNSB IT Center, München': 'snsb',
        'ZFMK – Zoological Research Museum Alexander Koenig – Leibniz Institute for Animal Biodiversity, Bonn': 'zfmk',
    }
)

HELPDESK_REQUEST_TYPE_MAPPINGS = getattr(
    settings,
    'HELPDESK_REQUEST_TYPE_MAPPINGS',
    {
        'ENA – European Nucleotide Archive': 'molecular',
        'default': 'generic'
    }
)

PANGAEA = getattr(
    settings,
    'PANGAEA',
    'PANGAEA'
)

# TODO: remove, this has to be handled by ArchiveAcess model
PANGAEA_ISSUE_BASE_URL = getattr(
    settings,
    'PANGAEA_ISSUE_BASE_URL',
    'https://issues.pangaea.de/rest/api/2/issue/'
)

PANGAEA_ISSUE_VIEW_URL = getattr(
    settings,
    'PANGAEA_ISSUE_VIEW_URL',
    'https://issues.pangaea.de/browse/'
)

PANGAEA_ISSUE_DOI_FIELD_NAME = getattr(
    settings,
    'PANGAEA_ISSUE_DOI_FIELD_NAME',
    'customfield_10520'
)

# TODO: rename
PRIMARY_DATA_FILE_DELAY = getattr(
    settings,
    'PRIMARY_DATA_FILE_DELAY',
    # seconds
    120
)

# TODO: rename
PRIMARY_DATA_FILE_MAX_RETRIES = getattr(
    settings,
    'PRIMARY_DATA_FILE_MAX_RETRIES',
    4
)
SEPARATOR = getattr(
    settings,
    'SEPARATOR',
    '.'
)

SUBMISSION_DELAY = getattr(
    settings,
    'SUBMISSION_DELAY',
    # seconds
    15
)

SUBMISSION_MAX_RETRIES = getattr(
    settings,
    'SUBMISSION_MAX_RETRIES',
    2
)

SUBMISSION_SAVE_TRIGGER_DELAY = getattr(
    settings,
    'SUBMISSION_SAVE_TRIGGER_DELAY',
    # seconds
    30
)

SUBMISSION_RETRY_DELAY = getattr(
    settings,
    'SUBMISSION_RETRY_DELAY',
    # seconds
    60 * 60
)

STATIC_SAMPLE_SCHEMA_LOCATION = getattr(
    settings,
    'STATIC_SAMPLE_SCHEMA_LOCATION',
    'schemas/sample.json'
)

STATIC_STUDY_SCHEMA_LOCATION = getattr(
    settings,
    'STATIC_STUDY_SCHEMA_LOCATION',
    'schemas/study.json'
)

STATIC_EXPERIMENT_SCHEMA_LOCATION = getattr(
    settings,
    'STATIC_EXPERIMENT_SCHEMA_LOCATION',
    'schemas/experiment.json'
)

STATIC_RUN_SCHEMA_LOCATION = getattr(
    settings,
    'STATIC_RUN_SCHEMA_LOCATION',
    'schemas/run.json'
)

STATIC_MIN_REQUIREMENTS_LOCATION = getattr(
    settings,
    'STATIC_MIN_REQUIREMENTS_LOCATION',
    'schemas/minimal_requirements.json'
)

STATIC_ENA_REQUIREMENTS_LOCATION = getattr(
    settings,
    'STATIC_ENA_REQUIREMENTS_LOCATION',
    'schemas/ena_requirements.json'
)

STATIC_GENERIC_REQUIREMENTS_LOCATION = getattr(
    settings,
    'STATIC_GENERIC_REQUIREMENTS_LOCATION',
    'schemas/gfbio_generic_requirements.json'
)
