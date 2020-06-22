import csv
import logging
import argparse
import os.path
from string import Template

parser = argparse.ArgumentParser(
    description="Read COGITO MAG metadata from CSV and prepare sample xml file for ENA binned assembly submission.")
parser.add_argument("-d", "--debug", action="store_const", const=logging.DEBUG,
                    help="Enable debug messages in output. Sets the logging level to DEBUG.",
                    default=logging.WARNING)
parser.add_argument("-f", "--force-overwrite", action="store_true", dest="overwrite",
                    help="If an output file with the same"
                         "name exists, it will be overwritten without prompting for confirmation. default=False")
parser.add_argument("-i", "--input", action="store", required=True, type=argparse.FileType('r'),
                    help="Input CSV file with metadata.")
parser.add_argument("-o", "--outfile", action="store", required=True,
                    help="Path to output file.")
parser.add_argument("-s", "--skip-header", action="store_true", dest="header",
                    help="Skip the first line of the CSV. DEFAULT=False")

args = parser.parse_args()

# SET logging LEVEL
log = logging.getLogger('cogito')
logging.basicConfig(level=args.debug)

# TODO: Check if outfile exists and honor overwrite option

log.debug("OUTPUT FILE: %s", args.outfile)
with open('sample_template.xml', 'r') as template:
    xml_template = Template(template.read())

log.debug(xml_template.template)

reader = csv.reader(args.input, delimiter='\t')

if args.header:
    next(reader, None)  # skip the headers
    log.debug("Skipping header...")

with open(args.outfile, 'w') as sample_file:
    sample_file.write("<SAMPLE_SET>")
    for row in reader:
        sample_xml = xml_template.substitute(mag_name=row[0],
                                             completeness=row[5],
                                             contamination=row[6],
                                             run=row[11],
                                             taxid=row[12])
        log.debug(sample_xml)
        sample_file.write(sample_xml)

    sample_file.write("</SAMPLE_SET>")
