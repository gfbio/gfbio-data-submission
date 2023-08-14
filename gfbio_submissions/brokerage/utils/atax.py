import csv
import os
import datetime
import logging


from django.utils.encoding import smart_str

import xml.etree.ElementTree as ET
from xml.etree.ElementTree import Element

import xmlschema

from gfbio_submissions.brokerage.utils.csv_atax import \
    add_unit_data, add_data_set, add_technical_contacts, \
    add_content_contacts, add_meta_data, add_units, add_unit, \
    add_unit_data_measurement, is_float, xsplit,add_unit_id, \
    add_necc_nodes_measurements, add_measurements_or_facts, \
    add_unit_data_multimedia, add_necc_nodes_multimedia, \
    add_multimediaobjects, add_multimediaobject

from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path

logger = logging.getLogger(__name__)

abcd_mapping_specimen = {
'specimen identifier': 'UnitID',
'basis of record': 'RecordBasis',
'scientific name': 'FullScientificNameString',
'country (area)': 'Country',
'locality': 'LocalityText',
'date: day': 'ISODateTimeBegin',
'date: month': 'ISODateTimeBegin',
'date: year': 'ISODateTimeBegin',
'catalogue number': 'PhysicalObjectID',
'field number': 'CollectorFieldNumber',
'collector/observer': 'AgentText',
'sex': 'Sex',
'kingdom': 'HigherClassification',
'other higher taxon': 'HigherTaxonName',
'rank of other higher taxon': 'HigherTaxonRank',
'longitude (decimal, wgs84)': 'LongitudeDecimal',
'latitude decimal (decimal, wgs84)': 'LatitudeDecimal',
'type status': 'TypeStatus',
'original name linked to type': 'TypifiedName',
'globally unique identifier (if existing)': 'UnitGUID',
}

abcd_mapping_specimen_keys = abcd_mapping_specimen.keys()

abcd_mapping_measurement = {
'specimen identifier': 'UnitID',
'measured by': 'MeasuredBy',
'time': 'MeasurementDateTime',
'date: day': 'MeasurementDateTime',
'date: month': 'MeasurementDateTime',
'date: year': 'MeasurementDateTime',
'method': 'Method',
'parameter': 'Parameter',
'trial': 'AppliesTo',
'lowervalue': 'LowerValue',
'unitofmeasurement': 'UnitOfMeasurement',
'isquantitative': 'IsQuantitative'
}

abcd_mapping_measurement_keys = abcd_mapping_measurement.values()

# right order here:
abcd_mapping_multimedia_pathes = {
'specimen identifier': 'UnitID',  #ZSM 5652/2012
'File name': 'MultiMediaObject/ID',   #Holotype_FGZC3761.jpg'
'File description': 'MultiMediaObject/Context',   # Holotype of Platypelis lateus (FGZC 3761) in life   /IPRStatements' Comment wäre auch mgl., nee für was anderes
'File type': 'MultiMediaObject/Format',   #Image
'IPR': 'MultiMediaObject/IPR/Text',   # Andolalao Rakotoarison    person with intellectual rights Text or without??
'License Holder': 'MultiMediaObject/IPR/Copyrights/Copyright',   # Zoologische Staatssammlung München
'License Type': 'MultiMediObject/IPR//Licenses/License/Text',   # CC BY-NC-SA 4.0   for statement, additionally add here 'URI'' like https://creativecommons.org/licenses/by-sa...
'Creator': 'MultiMediaObject/Creator',  #Andolalao Rakotoarison
}

abcd_mapping_multimedia = {
'specimen identifier': 'UnitID',
'file name': 'ID',
'file description': 'Context',
'file type': 'Format',
'ipr': 'Disclaimer',
'license holder': 'Copyright',
'license type': 'LicenseText',
'creator': 'Creator',
}
abcd_mapping_multimedia_keys = abcd_mapping_multimedia.keys()

attribute_value_blacklist = [
    'na', 'NA', 'n/a', 'N/A',
]

global_schema = None

#  ATAXER  base xml for atax -------------------------------------------------------
class Ataxer(object):

    #constructor
    def __init__(self, submission):

        self.atax_submission = submission

        #  determine the path for the ABCD validation schema file
        self.path_xsd = os.path.join(
            os.getcwd(),
            'gfbio_submissions/brokerage/schemas/ABCD_2.06.XSD')

        global global_schema
        if not global_schema:
        # Load and compile XSD schema
            global_schema = xmlschema.XMLSchema(self.path_xsd)

        self.schema =  global_schema

        # namespaces:
        self.xsi = "http://www.w3.org/2001/XMLSchema-instance"
        self.abcd = "http://www.tdwg.org/schemas/abcd/2.06"
        self.schemaLocation = " http://www.tdwg.org/schemas/abcd/2.06 http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"

        self.ns = {"xsi": self.xsi, "abcd": self.abcd}  # namespaces
        ET.register_namespace("abcd", "http://www.tdwg.org/schemas/abcd/2.06")
        self.abcdns = "{" + self.abcd + "}"  # namespace abcd for creating Elements


        self.root = Element("{http://www.tdwg.org/schemas/abcd/2.06}DataSets",
            attrib={"{" + self.xsi + "}schemaLocation": self.schemaLocation})

    # make class Ataxer JSON serializable:
    def to_json(self):

        return {
            'atax_submission': self.atax_submission,
            'path_xsd': self.path_xsd,
            'schema': self.schema,
            'xsi': self.xsi,
            'abcd': self.abcd,
            'schemaLocation': self.schemaLocation,
            'ns': self.ns,
            'abcdns': self.abcdns,
            'root': self.root
        }

    def map_fields_specimen(self, csv_dict, abcd_dict, result_dict=None):
        import datetime

        month = 1
        day = 1

        time_keys1 = ['date: day']
        time_keys2 = ['date: month']
        time_keys3 = ['date: year']
        time_mapped = ['IsoDateTimeBegin']


        result_dict = result_dict or {}
        csv_dict = {k.strip().lower(): v for k, v in csv_dict.items()}
        for k, v in csv_dict.items():
            if isinstance(v, dict):
                v = self.map_fields_specimen(v, abcd_dict)
            if k in abcd_dict.keys():
                if k in time_keys3:
                    year = str(v)
                    dtobj = datetime.datetime(int(year), int(month), int(day))
                    dtstr = dtobj.strftime("%Y-%m-%d")  # should be a string
                    result_dict["IsoDateTimeBegin"] = dtstr
                elif k in time_keys2:
                    month = str(v)
                elif k in time_keys1:
                    day = str(v)
                k = str(abcd_dict[k])  # key will be changed
            if k not in time_mapped:
                result_dict[k] = v
        return result_dict

    def map_fields_measurement(self, csv_dict, abcd_dict, result_dict=None):
        import datetime

        month = 1
        day = 1
        time = "00:00"

        time_keys0 = ['time']
        time_keys1 = ['date: day']
        time_keys2 = ['date: month']
        time_keys3 = ['date: year']
        time_mapped = ['MeasurementDateTime',]
        crea_date = True
        unknowns = ['none', 'nan', 'unknown', 'null', 'empty']

        result_dict = result_dict or {}
        csv_dict = {k.strip().lower(): v for k, v in csv_dict.items()}
        for k, v in csv_dict.items():
            if isinstance(v, dict):
                v = self.map_fields_measurement(v, abcd_dict)
            if k in abcd_dict.keys():
                if k in time_keys3:
                    if len(v) and v.strip().lower() not in unknowns and crea_date==True:
                        year = str(v)
                        if time:
                            dtobj = datetime.datetime(int(year), int(month), int(day), int(time.hour), int(time.minute))
                            dtstr = dtobj.strftime("%Y-%m-%dT%H:%M:%S")  # should be a string
                        else:
                            dtobj = datetime.datetime(int(year), int(month), int(day),0,0)
                            dtstr = dtobj.strftime("%Y-%m-%dT%H:%M:%S")  # should be a string
                        result_dict["MeasurementDateTime"] = dtstr
                    else:
                        crea_date=False
                elif k in time_keys2:
                    if len(v) and v.strip().lower() not in unknowns:
                        month = str(v)
                    else:
                        crea_date = False
                elif k in time_keys1:
                    if len(v) and v.strip().lower() not in unknowns:
                        day = str(v)
                    else:
                        crea_date=False
                elif k in time_keys0:
                    if len(v) and v.strip().lower() not in unknowns:
                        time = datetime.datetime.strptime(v, '%H:%M')  # time.hour, time.minut
                    else:
                        time = None

                k = str(abcd_dict[k])  # key is changed
            if (time_mapped.count(str(k))==0) and len(v) and v.strip().lower() not in unknowns:
                result_dict[k] = v
        return result_dict

    def map_fields_multimedia(self, csv_dict, abcd_dict, result_dict=None):

        result_dict = result_dict or {}
        csv_dict = {k.strip().lower(): v for k, v in csv_dict.items()}
        for k, v in csv_dict.items():
            if isinstance(v, dict):
                v = self.map_fields_multimedia(v, abcd_dict)
            if k in abcd_dict.keys():
                k = str(abcd_dict[k])  # key will be changed
            result_dict[k] = v
        return result_dict

    def create_atax_submission_base_xml(self):
        logger.info(
            msg='Ataxer create_submission_xml. currentdate={}'.format(
                datetime.date.today().isoformat()))

        dataset = add_data_set(self.root, self.abcdns)

        # add necessary abcd nodes:
        add_technical_contacts(dataset, self.abcdns, self.atax_submission.user)

        add_content_contacts(dataset, self.abcdns, self.atax_submission.user)
        add_meta_data(dataset, self.abcdns, self.atax_submission.user, self.atax_submission.created)
        units = add_units(dataset, self.abcdns)

        return self.root, units


    def read_and_map_specimen_csv(self,  csv_file):
        header = csv_file.readline()
        dialect = csv.Sniffer().sniff(smart_str(header))
        csv_file.seek(0)
        delimiter = dialect.delimiter if dialect.delimiter in [',', ';',
                                                               '\t'] else ';'
        # read the csv data from file:
        csv_reader = csv.DictReader(
            csv_file,
            quoting=csv.QUOTE_ALL,
            delimiter=delimiter,
            quotechar='"',
            skipinitialspace=True,
            restkey='extra_columns_found',
            restval='extra_value_found',
        )

        # map the csv fields to abcd terms:
        csv_data = []
        csv_data_p = list(csv_reader)
        for rowdict in csv_data_p:
            row = self.map_fields_specimen(rowdict, abcd_mapping_specimen)
            csv_data.append(row)

        return csv_data

    def read_and_map_measurement_csv(self,  csv_file):

        header = csv_file.readline()
        dialect = csv.Sniffer().sniff(smart_str(header))
        csv_file.seek(0)
        delimiter = dialect.delimiter if dialect.delimiter in [',', ';',
                                                               '\t'] else ';'
        known_tags = ['UnitID', 'MeasuredBy', 'MeasurementDateTime', 'Method']
        extra_tags = ['AppliesTo']
        delimiters = '(|['
        csv_reader = csv.DictReader(
            csv_file,
            quoting=csv.QUOTE_ALL,
            delimiter=delimiter,
            quotechar='"',
            skipinitialspace=True,
            restkey='extra_columns_found',
            restval='extra_value_found',
        )

        # map the csv fields to abcd terms:
        reformed_row = {}
        collection_dict = {}

        csv_data = []

        csv_data_p = list(csv_reader)
        for dictrow in csv_data_p:
            reduced_row = {}
            extra_row = {}
            unit_dict = {}

            one_row_list = []

            row = self.map_fields_measurement(dictrow, abcd_mapping_measurement)
            for i in row.keys():

                reformed_row = {}
                collection_dict = {}

                if(i in known_tags):
                    val = row[i]
                    reduced_row[i] = val
                    collection_dict.update(reduced_row)
                    if i==known_tags[0] and len(unit_dict)==0:
                        unit_dict[i] = val
                        one_row_list.append(unit_dict)
                elif (i in extra_tags):
                    val = row[i]
                    extra_row[i] = val
                else:
                    val = row[i]
                    split_result = xsplit(delimiters, str(i), 1) #  a list
                    reformed_row["Parameter"] = split_result[0].strip()
                    if(len(extra_row)):
                        reformed_row.update(extra_row)

                    reformed_row["LowerValue"] = val

                    if(len(split_result)>1):
                        reformed_row["UnitOfMeasurement"] = split_result[1].strip(' ()')

                    if(is_float(val)):
                        reformed_row["IsQuantitative"] = 'true'
                    else:
                        reformed_row["IsQuantitative"] = 'false'

                    collection_dict.update(reduced_row)
                    if reformed_row:
                        collection_dict.update(reformed_row)  # 9 fields
                    one_row_list.append(collection_dict)

            if not reformed_row:
                one_row_list.append(collection_dict)
            csv_data.append(one_row_list)

        return csv_data


    def read_and_map_multimedia_csv(self,  csv_file):
        header = csv_file.readline()
        dialect = csv.Sniffer().sniff(smart_str(header))
        csv_file.seek(0)
        delimiter = dialect.delimiter if dialect.delimiter in [',', ';',
                                                               '\t'] else ';'
        csv_reader = csv.DictReader(
            csv_file,
            quoting=csv.QUOTE_ALL,
            delimiter=delimiter,
            quotechar='"',
            skipinitialspace=True,
            restkey='extra_columns_found',
            restval='extra_value_found',
        )

        # map the csv fields to abcd terms:
        csv_data = []
        csv_data_p = list(csv_reader)
        for rowdict in csv_data_p:
            row = self.map_fields_multimedia(rowdict, abcd_mapping_multimedia)
            csv_data.append(row)
            csv_data.sort(key=lambda row: row["UnitID"])

        return csv_data

    # now for specimen file only
    def convert_csv_data_to_xml(self, csv_data, units, keyword):
        # explicit procedure 'add_unit_data' to fill data records:
        length = len(csv_data)
        for i in range(length):
            unid = csv_data[i]['UnitID']
            unit = add_unit(units, self.abcdns)
            match keyword:
                case 'specimen':
                    add_unit_data(unit, self.abcdns, unid, csv_data[i])
                case _:
                    pass

    def convert_measurement_csv_data_to_xml(self, csv_data, units, keyword):

        length = len(csv_data)   # csv_data is a double list [[]]
        for item in csv_data:
            i=-1
            facts_node = False
            for mdict in item:
                i=i+1
                single_dict = mdict  # dict contains UnitID
                if isinstance(single_dict, dict):
                    if i == 0:
                        if single_dict.get('UnitID', None):
                            unit = add_unit(units, self.abcdns)

                            add_necc_nodes_measurements(unit, self.abcdns, single_dict.get('UnitID'))
                            add_unit_id(unit, self.abcdns, single_dict.get('UnitID'))
                            measurementsorfacts = add_measurements_or_facts(unit, self.abcdns)
                            facts_node = True
                    else:
                        if(facts_node):
                            add_unit_data_measurement(measurementsorfacts, self.abcdns, single_dict.get('UnitID'), mdict)


    def convert_multimedia_csv_data_to_xml(self, csv_data, units, keyword):

        length = len(csv_data)
        prev_UnitID =''
        for item in csv_data:
            if item.get('UnitID', None):
                curr_UnitID = item.get('UnitID')
                if prev_UnitID != curr_UnitID:
                    unit = add_unit(units, self.abcdns)
                    add_necc_nodes_multimedia(unit, self.abcdns, item.get('UnitID'))
                    add_unit_id(unit, self.abcdns, item.get('UnitID'))
                    multimediaobjects = add_multimediaobjects(unit, self.abcdns)
                    add_multimediaobject(multimediaobjects, self.abcdns, item.get('UnitID'), item)
                else:
                    add_multimediaobject(multimediaobjects, self.abcdns, item.get('UnitID'),item)

                prev_UnitID=curr_UnitID


    def finish_atax_xml(self, root):

        try:
            xml_file_name = "primary_upload"
            xml_file_name = xml_file_name + '.xml'
            xml_file_name = ''.join(('xml_files/', xml_file_name))
            # another path construction necessary here!
            with open(os.path.join(_get_test_data_dir_path(), xml_file_name), 'wb') as f:

                tree = ET.ElementTree(self.root)
                tree.write(f, encoding="utf-8", xml_declaration=True)  # , pretty_print=True, lxml only)
                f.close()
        except:
            pass

        try:
            # unicode is important , we need a string to continue!
            return ET.tostring(self.root, encoding='unicode', method='xml')
        except:
            return None

    # End ATAXER


def create_ataxer(submission):
    ataxer = Ataxer(submission=submission)
    return ataxer


def analyze_filename_and_type(upload_name, meta_type):
    #meta_type condition is removed, maybe its possible to use it as an additional indicator?
    if 'specimen' in upload_name:
        return 'specimen'
    elif 'measurement' in upload_name:
        return 'measurement'
    elif 'multimedia' in upload_name:
        return 'multimedia'
    else:
        return ''


def parse_taxonomic_csv_specimen(submission, csv_file):

    try:

        ataxer = create_ataxer(submission)

        root, units = ataxer.create_atax_submission_base_xml()

        # returns a list
        csv_data = ataxer.read_and_map_specimen_csv(csv_file)

        ataxer.convert_csv_data_to_xml(csv_data, units, 'specimen')

        xml_string = ataxer.finish_atax_xml(root)

        return xml_string

    except:
        return None


def parse_taxonomic_csv_measurement(submission, csv_file):

    try:

        ataxer = create_ataxer(submission)

        root, units = ataxer.create_atax_submission_base_xml()

        # returns a list
        csv_data = ataxer.read_and_map_measurement_csv(csv_file)

        ataxer.convert_measurement_csv_data_to_xml(csv_data, units, 'measurement')

        xml_string = ataxer.finish_atax_xml(ataxer.root)

        return xml_string

    except:
        return None


def parse_taxonomic_csv_multimedia(submission, csv_file):

    try:

        ataxer = create_ataxer(submission)

        root, units = ataxer.create_atax_submission_base_xml()

        # returns a list
        csv_data = ataxer.read_and_map_multimedia_csv(csv_file)

        ataxer.convert_multimedia_csv_data_to_xml(csv_data, units, 'multimedia')

        xml_string = ataxer.finish_atax_xml(root)

        return xml_string

    except:
        return None  #False, error


def find_node_in_root(nodes_root, nodes_name):
    posi = -1
    found = False
    for child in nodes_root:
        posi = posi + 1
        if str(child.tag).endswith(nodes_name):
            found = True
            break
    return found,posi


def update_specimen_with_measurements_abcd_xml(upload, name):
    # basis:
    if str(name).upper() in upload.keys():
        if str(name).upper()=='COMBINATION':
            toinclude_tuple = upload['COMBINATION']
            toinclude_abcd = str(toinclude_tuple[1])
        elif str(name).upper()=='SPECIMEN':
            toinclude_tuple = upload['SPECIMEN']
            toinclude_abcd = str(toinclude_tuple[1])


        #do this, if both specimen nd measurements are there:
        if 'MEASUREMENT' in upload.keys():
            measurement_tuple = upload['MEASUREMENT']
            measurement_abcd = str(measurement_tuple[1])
            # roots for both xml constructs:
            tree_meas_root = ET.fromstring(measurement_abcd)
            tree_spec_root = ET.fromstring(toinclude_abcd)

            #take the following from Ataxer:
            #xsi = "http://www.w3.org/2001/XMLSchema-instance"
            #abcd = "http://www.tdwg.org/schemas/abcd/2.06"
            #schemaLocation = " http://www.tdwg.org/schemas/abcd/2.06 http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"
            # namespaces
            # ns = {"xsi":xsi, "abcd":abcd}
            # abcdns = "{" + abcd + "}"  # namespace abcd for creating Elements

            ET.register_namespace("abcd", "http://www.tdwg.org/schemas/abcd/2.06")

            result = {}
            meas_keys_found = []

            # measurement
            # units node is there max 1x:
            collection1 = tree_meas_root.findall(".//{http://www.tdwg.org/schemas/abcd/2.06}Units")  #list of elements

            collection1_string = ET.tostring(collection1[0], encoding='unicode', method='xml')
            units_root = ET.fromstring(collection1_string)
            # this should work with whole tree_meas_root too instead of subelement units_root!
            collection = units_root.findall(".//{http://www.tdwg.org/schemas/abcd/2.06}Unit")   #list of elements

            # create dictionary for UnitID, MeasurementOrFacts  xml string
            for unit in collection:
                unit_string = ET.tostring(unit, encoding='unicode', method='xml')
                unit_root = ET.fromstring(unit_string)

                unitid = unit_root.find(".//{http://www.tdwg.org/schemas/abcd/2.06}UnitID")       #Element
                measorfacts = unit_root.find(".//{http://www.tdwg.org/schemas/abcd/2.06}MeasurementsOrFacts")  #Element
                unitid_content = unitid.text
                result[unitid_content] = measorfacts

        # insert  MeasurementOrFacts into specimen part:
        for unit_spec in tree_spec_root.findall(".//{http://www.tdwg.org/schemas/abcd/2.06}Unit"):

            found,pos=find_node_in_root(unit_spec, 'Sex')
            unitidstr = str(unit_spec.find(".//{http://www.tdwg.org/schemas/abcd/2.06}UnitID").text)

            if unitidstr in result.keys():
                # as return value only:
                meas_keys_found.append(unitidstr)

                if found:
                    unit_spec.insert(pos, result[unitidstr])
                else:
                    unit_spec.append(result[unitidstr])  #element append measurements

        res_after_insert = ET.tostring( tree_spec_root, encoding='unicode', method='xml')

        #test writing, remove:
        try:

            xml_file_name = "further_upload"
            xml_file_name = xml_file_name + 'SM.xml'
            xml_file_name = ''.join(('xml_files/', xml_file_name))
            # another path construction necessary here!
            with open(os.path.join(_get_test_data_dir_path(), xml_file_name), 'wb') as f:

                tree = ET.ElementTree(tree_spec_root)
                tree.write(f, encoding="utf-8", xml_declaration=True)  # , pretty_print=True, lxml only)
                f.close()
        except:
            pass

    return res_after_insert,  meas_keys_found

def update_specimen_with_multimedia_abcd_xml(upload, name):
    # basis:
    if str(name).upper() in upload.keys():
        if str(name).upper() == 'COMBINATION':
            toinclude_tuple = upload['COMBINATION']
            toinclude_abcd = str(toinclude_tuple[1])
        elif str(name).upper() == 'SPECIMEN':
            toinclude_tuple = upload['SPECIMEN']
            toinclude_abcd = str(toinclude_tuple[1])

        #do this, if both specimen ad multimedia are there:
        if 'MULTIMEDIA' in upload.keys():
            multimedia_tuple = upload['MULTIMEDIA']
            multimedia_abcd = str(multimedia_tuple[1])

            tree_mult_root = ET.fromstring(multimedia_abcd)
            tree_spec_root = ET.fromstring(toinclude_abcd)

            #take the following from Ataxer:
            #xsi = "http://www.w3.org/2001/XMLSchema-instance"
            #abcd = "http://www.tdwg.org/schemas/abcd/2.06"
            #schemaLocation = " http://www.tdwg.org/schemas/abcd/2.06 http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"
            #abcdns = "{" + abcd + "}"  # namespace abcd for creating Elements
            # namespaces
            #ns = {"xsi": xsi, "abcd": abcd}

            ET.register_namespace("abcd", "http://www.tdwg.org/schemas/abcd/2.06")

            result = {}
            multi_keys_found = []

            # units is there max 1x:
            units_collection = tree_mult_root.findall(".//{http://www.tdwg.org/schemas/abcd/2.06}Units")

            units_collection_string = ET.tostring(units_collection[0], encoding='unicode', method='xml')
            units_root = ET.fromstring(units_collection_string)

            unit_collection = units_root.findall(".//{http://www.tdwg.org/schemas/abcd/2.06}Unit")   #list of elements

            # create dictionary for UnitID, MultimediaObjects  xml string
            for unit in unit_collection:
                unit_string = ET.tostring(unit, encoding='unicode', method='xml')
                unit_root = ET.fromstring(unit_string)

                unitid = unit_root.find(".//{http://www.tdwg.org/schemas/abcd/2.06}UnitID")       #Element
                multis = unit_root.find(".//{http://www.tdwg.org/schemas/abcd/2.06}MultiMediaObjects")  #Element
                unitid_content = unitid.text
                result[unitid_content] = multis


        # insert  MultimediaObjects into specimen part:
        for unit_spec in tree_spec_root.findall(".//{http://www.tdwg.org/schemas/abcd/2.06}Unit"):

            unitidstr = str(unit_spec.find(".//{http://www.tdwg.org/schemas/abcd/2.06}UnitID").text)

            found, pos = find_node_in_root(unit_spec, 'Gathering')

            if unitidstr in result.keys():

                multi_keys_found.append(unitidstr)

                if found:
                    unit_spec.insert(pos, result[unitidstr])
                else:
                    unit_spec.append(result[unitidstr])

        res_after_insert = ET.tostring(tree_spec_root, encoding='unicode', method='xml')

        # test writing, remove:
        try:

            xml_file_name = "further_upload"
            xml_file_name = xml_file_name + 'MM.xml'
            xml_file_name = ''.join(('xml_files/', xml_file_name))
            # another path construction necessary here!
            with open(os.path.join(_get_test_data_dir_path(), xml_file_name), 'wb') as f:

                tree = ET.ElementTree(tree_spec_root)
                tree.write(f, encoding="utf-8", xml_declaration=True)  # , pretty_print=True, lxml only)
                f.close()
        except:
            pass

    return res_after_insert, multi_keys_found