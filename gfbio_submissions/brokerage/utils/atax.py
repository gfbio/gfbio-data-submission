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

#Measured by,Method,Trial,Time,Date: Day,Date: Month,Date: Year,Snout-vent length (mm),Head width (mm),Head length (mm),Tympanum diameter (mm),Eye diameter (mm),Eye-nostril distance (mm),Nostril-snout tip distance (mm),Nostril-nostril distance (mm),Forelimb length (mm),Hand length (mm),Hindlimb length (mm),Foot+tarsus length (mm),Foot length (mm),Tibia length (mm)

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

#  ATAXER  base xml for atax -------------------------------------------------------
class Ataxer(object):

    #constructor
    def __init__(self, submission):

        self.atax_submission = submission

        #  determine the path for the ABCD validation schema file
        self.path_xsd = os.path.join(
            os.getcwd(),
            'gfbio_submissions/brokerage/schemas/ABCD_2.06.XSD')

        # Load and compile XSD schema
        self.schema = xmlschema.XMLSchema(self.path_xsd)

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
                        dtobj = datetime.datetime(int(year), int(month), int(day), int(time.hour), int(time.minute))
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
                        crea_date=False
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

        # root = Element(abcdns + "DataSets", attrib={"{" + xsi + "}schemaLocation": schemaLocation}, nsmap="abcd")

        # create xml structure according abcd rules:
        # add root of the xml structure and add sub structures in the right order
        dataset = add_data_set(self.root, self.abcdns)

        for elem in self.root.iter():
            if 'DataSet' in elem.tag:
                print("123")
            else:
                continue
        # add necessary abcd nodes:
        add_technical_contacts(dataset, self.abcdns, self.atax_submission.user)
        for elem in self.root.iter():
            if 'TechnicalContacts' in elem.tag:
                print("456")
            else:
                continue
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
        import re

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
            #one_row_list.clear()
            one_row_list = []
            #one_row_list.clear()
            row = self.map_fields_measurement(dictrow, abcd_mapping_measurement)
            for i in row.keys():
                #reduced_row = {}
                reformed_row = {}
                collection_dict = {}
                #extra_row = {}
                if(i in known_tags):
                    val = row[i]
                    reduced_row[i] = val
                    collection_dict.update(reduced_row)
                    if i==known_tags[0] and len(unit_dict)==0:
                        unit_dict[i] = val
                        one_row_list.append(unit_dict)
                elif (i in extra_tags):  #allpliesto=trial
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
                    #reformed_row.update("Parameter": key) #= {"Parameter": key, "LowerValue": value}  #[{"Parameter": key, "LowerValue": value}  for key, value in row.items()  and key not in known_tags]

                    collection_dict.update(reduced_row)
                    if reformed_row:
                        collection_dict.update(reformed_row)  # 9 fields
                    one_row_list.append(collection_dict)

            if not reformed_row:
                one_row_list.append(collection_dict)
            csv_data.append(one_row_list)
            #csv_data.append(row)


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

    def convert_measurement_csv_data_to_xml_alt(self, csv_data, units, keyword):
        # explicit procedure 'add_unit_data' to fill data records:
        length = len(csv_data)   ##csv_data is a doulbe list [[]]

        for i, item in enumerate(csv_data):

            unit_dict = item[i]  # dict with UnitID
            if isinstance(unit_dict, dict):
                if i == 0:
                    if unit_dict.get('UnitID', None):
                        unit = add_unit(units, self.abcdns)
                else:
                    add_necc_nodes_measurements(unit, self.abcdns, unit_dict.get('UnitID'))
                    add_unit_data_measurement(unit, self.abcdns, unit_dict.get('UnitID'), item[i])
                        # unit = add_unit_id(units, self.abcdns, unit_dict.get('UnitID'))
            # else:
                    # add_unit_data_measurement(unit, self.abcdns, unit_dict.get('UnitID'), item[i])

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

                            for child in self.root:
                                print(child.tag, child.attrib)
                            add_necc_nodes_measurements(unit, self.abcdns, single_dict.get('UnitID'))
                            add_unit_id(unit, self.abcdns, single_dict.get('UnitID'))
                            measurementsorfacts = add_measurements_or_facts(unit, self.abcdns)
                            facts_node = True
                    else:
                        if(facts_node):
                            add_unit_data_measurement(measurementsorfacts, self.abcdns, single_dict.get('UnitID'), mdict)



    def finish_atax_xml(self, root):
        try:
            #xml_file_name = os.path.basename(self.csv_file.name)
            #xml_file_name = (os.path.splitext(xml_file_name))[0]
            xml_file_name = "test_measurement_csv"
            xml_file_name = xml_file_name + '1.xml'
            xml_file_name = ''.join(('xml_files/', xml_file_name))
            # another path construction necessary here!
            with open(os.path.join(_get_test_data_dir_path(), xml_file_name), 'wb') as f:
                # tree = root.getroottree()
                for child in self.root:
                    print(child.tag, child.attrib)
                tree = ET.ElementTree(self.root)
                tree.write(f, encoding="utf-8", xml_declaration=True)  # , pretty_print=True, lxml only)
                f.close()
        except:
            pass

        xmlstr = minidom.parseString(ET.tostring(root)).toprettyxml(indent="    ")

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

        for elem in root.iter():
            if 'Units' in elem.tag:
                print("456")
            else:
                continue

        # returns a list
        csv_data = ataxer.read_and_map_measurement_csv(csv_file)

        ataxer.convert_measurement_csv_data_to_xml(csv_data, units, 'measurement')

        for elem in root.iter():
            if 'Unit' in elem.tag:
                print("456")
            else:
                continue
        for elem in ataxer.root.iter():
            if 'Unit' in elem.tag:
                print("456")
            else:
                continue

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

