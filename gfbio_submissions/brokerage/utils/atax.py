import csv
import os
import datetime
import logging


from django.utils.encoding import smart_str

import xml.etree.ElementTree as ET
from xml.etree.ElementTree import Element

from xml.dom import minidom

import xmlschema

from gfbio_submissions.brokerage.utils.csv_atax import \
    add_unit_data, add_data_set, add_technical_contacts, \
    add_content_contacts, add_meta_data, add_units, add_unit, \
    add_unit_data_measurement, is_float, xsplit,add_unit_id, \
    add_necc_nodes_measurements, add_measurements_or_facts

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

# original headers:
# Measured by,Method,Trial,Time,Date: Day,Date: Month,Date: Year,Snout-vent length (mm),Head width (mm),Head length (mm),Tympanum diameter (mm),Eye diameter (mm),Eye-nostril distance (mm),Nostril-snout tip distance (mm),Nostril-nostril distance (mm),Forelimb length (mm),Hand length (mm),Hindlimb length (mm),Foot+tarsus length (mm),Foot length (mm),Tibia length (mm)

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

abcd_mapping_multimedia = {
'specimen identifier': 'UnitID',
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


        # Create XML root element:
        # root = Element(schema.root.name, attrib=schema.root.attributes)
        # self.root = Element(self.abcdns + "DataSets", attrib={"{" + self.xsi + "}schemaLocation": self.schemaLocation}, nsmap="abcd")

        self.root = Element("{http://www.tdwg.org/schemas/abcd/2.06}DataSets",
            attrib={"{" + self.xsi + "}schemaLocation": self.schemaLocation})

    # make class JSON serializable:
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
        date_string = str()
        year = 1
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
                k = str(abcd_dict[k])  # key is changed
            if k not in time_mapped:
                result_dict[k] = v
        return result_dict

    def map_fields_measurement(self, csv_dict, abcd_dict, result_dict=None):
        import datetime
        date_string = str()
        year = 1
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
                        time = datetime.datetime.strptime(v, '%H:%M')  #print time.hour, time.minut
                    else:
                        time = None
                    #    crea_date=False
                k = str(abcd_dict[k])  # key is changed
            if (time_mapped.count(str(k))==0) and len(v) and v.strip().lower() not in unknowns:
                result_dict[k] = v
        return result_dict

    def map_fields_multimedia(self, csv_dict, abcd_dict, result_dict=None):
        import datetime
        date_string = str()
        year = 1
        month = 1
        day = 1

        time_keys1 = ['date: day']
        time_keys2 = ['date: month']
        time_keys3 = ['date: year']
        time_mapped = ['IsoDateTimeBegin']

        result_dict = result_dict or {}

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
        reduced_row = {}
        reformed_row = {}
        extra_row = {}
        collection_dict = {}

        csv_data = []
        #one_row_list = []
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
                    #reduced_row = [{key: value} for key, value in row.items() and key in known_fields]
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
            row = self.map_fields_multimedia(rowdict, abcd_mapping_multimedia)
            csv_data.append(row)

        return csv_data

    # now for sample file only
    def convert_csv_data_to_xml(self, csv_data, units, keyword):
        # explicit procedure 'add_unit_data' to fill data records:
        length = len(csv_data)
        for i in range(length):
            unid = csv_data[i]['UnitID']
            unit = add_unit(units, self.abcdns)
            match keyword:
                case 'specimen':
                    add_unit_data(unit, self.abcdns, unid, csv_data[i])
                case 'measurement111':
                    add_unit_data_measurement(unit, self.abcdns, unid, csv_data[i])
                case 'multimedia111':
                    add_unit_data(unit, self.abcdns, unid, csv_data[i])
                case _:
                    pass

    def convert_measurement_csv_data_to_xml(self, csv_data, units, keyword):

        for child in self.root:
            print(child.tag, child.attrib)
        length = len(csv_data)   ##csv_data is a double list [[]]
        for item in csv_data:  #11 elems
            i=-1
            facts_node = False
            for mdict in item:     #15 elems, ordered as list
                i=i+1

                single_dict = mdict  # dict with UnitID
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



    def finish_atax_xml(self, root):
        try:

            xml_file_name = "test_measurement_csv"
            xml_file_name = xml_file_name + '1.xml'
            xml_file_name = ''.join(('xml_files/', xml_file_name))
            # another path construction necessary here!
            with open(os.path.join(_get_test_data_dir_path(), xml_file_name), 'wb') as f:

                for child in self.root:
                    print(child.tag, child.attrib)
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

    if 'specimen' in upload_name or meta_type is True:
        return 'specimen'
    elif 'measurement' in upload_name and meta_type is False:
        return 'measurement'
    elif 'multimedia' in upload_name and meta_type is False:
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
        return None  #False, error


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
        return None  #False, error


def parse_taxonomic_csv_multimedia(submission, csv_file):

    try:

        ataxer = create_ataxer(submission)

        root, units = ataxer.create_atax_submission_base_xml()

        # returns a list
        csv_data = ataxer.read_and_map_multimedia_csv(csv_file)

        ataxer.convert_csv_data_to_xml(csv_data, units, 'multimedia')

        xml_string = ataxer.finish_atax_xml(root)

        return xml_string
    except:
        return None  #False, error


def update_specimen_measurements_abcd_xml(atax_submission_upload):

    if 'SPECIMEN' in atax_submission_upload.keys():

        specimen_tuple = atax_submission_upload['SPECIMEN']
        specimen_abcd = str(specimen_tuple[1])

        #do this, if both specimen nd measurements are there:
        if 'MEASUREMENT' in atax_submission_upload.keys():
            measurement_tuple = atax_submission_upload['MEASUREMENT']
            measurement_abcd = str(measurement_tuple[1])

            tree_meas_root = ET.fromstring(measurement_abcd)
            tree_spec_root = ET.fromstring(specimen_abcd)

            #take the following from Ataxer:
            xsi = "http://www.w3.org/2001/XMLSchema-instance"
            abcd = "http://www.tdwg.org/schemas/abcd/2.06"
            schemaLocation = " http://www.tdwg.org/schemas/abcd/2.06 http://www.bgbm.org/TDWG/CODATA/Schema/ABCD_2.06/ABCD_2.06.XSD"

            ET.register_namespace("abcd", "http://www.tdwg.org/schemas/abcd/2.06")
            abcdns = "{" + abcd + "}"  # namespace abcd for creating Elements

            result = {}

            # namespaces
            ns = {"xsi":xsi, "abcd":abcd}

            collection1 = tree_meas_root.findall(".//{http://www.tdwg.org/schemas/abcd/2.06}Units")  #list of elements
            # units is there max 1x
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

            unitidstr = str(unit_spec.find(".//{http://www.tdwg.org/schemas/abcd/2.06}UnitID").text)

            #new for removing sex, this belongs in the sequence after MeasurementsOrFacts:

            elemsex = unit_spec.find(".//{http://www.tdwg.org/schemas/abcd/2.06}Sex")
            if elemsex is not None:
                #unitsexstr = str(unit_spec.find(".//{http://www.tdwg.org/schemas/abcd/2.06}Sex").text)
                #if unitsexstr:
                unit_spec.remove(unit_spec.find(".//{http://www.tdwg.org/schemas/abcd/2.06}Sex"))

            if unitidstr in result.keys():
                unit_spec.append(result[unitidstr])  #element append measurements
                if elemsex is not None:
                    unit_spec.append(elemsex)

        res_after_insert = ET.tostring( tree_spec_root, encoding='unicode', method='xml')

        #test writing, remove:

        try:

            xml_file_name = "test_measurement_csv"
            xml_file_name = xml_file_name + 'C.xml'
            xml_file_name = ''.join(('xml_files/', xml_file_name))
            # another path construction necessary here!
            with open(os.path.join(_get_test_data_dir_path(), xml_file_name), 'wb') as f:

                for child in tree_spec_root:
                    print(child.tag, child.attrib)
                tree = ET.ElementTree(tree_spec_root)
                tree.write(f, encoding="utf-8", xml_declaration=True)  # , pretty_print=True, lxml only)
                f.close()
        except:
            pass

    return res_after_insert