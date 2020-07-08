import argparse
import csv
import datetime
import json
import logging
import re
from Bio.Seq import Seq
from Bio import SeqIO

parser = argparse.ArgumentParser("This script does the following:"
                                 "TODO"
                                 )

parser.add_argument("-d", "--debug", action="store_const", const=logging.DEBUG,
                    default=logging.INFO,
                    help="Enable debug messages in output. Sets the logging level to DEBUG.")
parser.add_argument("-m", "--metadata-csv", action="store", dest="metadata",
                    help="Read metadata from CSV")
parser.add_argument("-o", "--output", action="store", dest="output",
                    help="Store sample output in file.")
parser.add_argument("-r", "--ribosomal", action="store", dest="sediment",
                    help="Allowed values: 18S,16S,COI")
parser.add_argument("-s", "--sequence-fasta", action="store", dest="fasta",
                    help="Sequence FASTA")
parser.add_argument("-t", "--tax-map", action="store", dest="taxonomy",
                    help="Taxononmy in JSON lookup repsonse from ENA API.")

args = parser.parse_args()

# SET logging LEVEL
log = logging.getLogger('')
logging.basicConfig(level=args.debug)

fh = logging.FileHandler('test.log')
fh.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
log.addHandler(fh)
log.addHandler(ch)

output = args.output
metadata = args.metadata
fasta = args.fasta
sediment = args.sediment

metadata_map = {}

with open(metadata) as csvfile:
    log.debug("Opening metadata file: {}".format(metadata))
    reader = csv.reader(csvfile, delimiter=';')
    # template = next(reader, None)  # skipping template accession comment
    headers = next(reader, None)
    log.debug("TSV headers: {}".format(headers))
    for row in reader:
        entry = dict(zip(headers, row))
        log.debug(entry)
        metadata_map[entry['sample_title']] = entry
    log.debug(metadata_map)

taxmap = {}
with open(args.taxonomy) as taxfile:
    log.debug("Opening taxonomy lookup map: {}".format(args.taxonomy))
    tax = json.load(taxfile)
    log.debug("TAXMAP: {}".format(tax))
    for ten in tax:
        log.debug("TAXID: {} {}".format(ten['taxId'], ten['submittable']))
        if ten['submittable'] == 'true':
            log.debug("Adding {} to taxmap.".format(ten['scientificName']))
            taxmap[ten['taxId']] = ten['scientificName']

log.debug(taxmap)

counter = 0
output_list = []
if sediment == '16S':
    csv_fields = ['ENTRYNUMBER', 'ORGANISM_NAME', 'ENV_SAMPLE', 'SEDIMENT',
                  'ISOLATION_SOURCE', 'ISOLATE', 'COLDATE', "LAT_LON",
                  'SEQUENCE']
elif sediment == '18S':
    csv_fields = ['ENTRYNUMBER', 'ORGANISM_NAME', 'ENV_SAMPLE', 'SEDIMENT',
                  'ISOLATE', 'COLDATE', "LAT_LON",
                  'SEQUENCE']
elif sediment == 'COI':
    csv_fields = ['ENTRYNUMBER', 'ORGANISM', 'ISOLATE', '5CDS', '3CDS',
                  '5PARTIAL', '3PARTIAL', 'COITABLE', 'COLDATE', 'LATLON',
                  'SEQUENCE']

for record in SeqIO.parse(fasta, "fasta"):
    counter += 1

    log.debug("COUNTER: {}".format(counter))
    log.info(record.description)
    if sediment == 'COI':
        organism = re.sub(r' cytochrome c oxidase*', '', record.description)
    else:
        organism = record.description.replace(
            ' {} ribosomal RNA gene'.format(args.sediment), '')
    log.debug("ORGANISM: {}".format(organism))
    orgname = organism.rsplit(' ', 1)

    md = metadata_map.get(record.description, 'NA')
    if md == 'NA':
        log.warning('NO metadata found for {}'.format(record.description))
        taxonomy = "TODO"
        coldate = 'MM-YYYY'
        latlon = 'LatLon'
    else:
        coldate_verbatim = md['collection date']
        log.debug("COLDATE verbatim: {}".format(coldate_verbatim))
        datetime_object = datetime.datetime.strptime(coldate_verbatim, '%Y-%m')
        coldate = datetime_object.strftime('%b-%Y')
        log.debug("COLDATE: {}".format(coldate))

        log.debug("LAT_LON verbatim: {} {}".format(
            md['geographic location (latitude)'],
            md['geographic location (longitude)']))
        lat = md['geographic location (latitude)'].strip()
        lat_fields = lat.split(' ')
        lat_fields[0] = round(float(lat_fields[0]), 2)
        latitude = ' '.join([str(x) for x in lat_fields])

        lon = md['geographic location (longitude)'].strip()
        lon_fields = lon.split(' ')
        lon_fields[0] = round(float(lon_fields[0]), 2)
        longitude = ' '.join([str(x) for x in lon_fields])

        log.debug("LAT_LON: {} {}".format(latitude, longitude))
        latlon = "{} {}".format(latitude, longitude)
        location = md['geographic location (country and/or sea)']
        try:
            taxonomy = taxmap[md['taxon_id']]
        except KeyError:
            taxonomy = "TODO"

    # log.debug('TAXONOMY: {}'.format(taxonomy))
    isolate = orgname[1]
    log.debug('ISOLATE: {}'.format(organism))
    outrecord = {}

    outrecord['ENTRYNUMBER'] = counter
    if sediment in ['16S', '18S']:
        outrecord['ORGANISM_NAME'] = taxonomy
        outrecord['SEDIMENT'] = sediment
        outrecord['LAT_LON'] = latlon
        if args.sediment == '16S':
            outrecord['ENV_SAMPLE'] = 'yes'
            outrecord['ISOLATION_SOURCE'] = 'mussle symbiont'
        else:
            outrecord['ENV_SAMPLE'] = 'no'
    else:
        outrecord['ORGANISM'] = taxonomy
        outrecord['LATLON'] = latlon
        outrecord['COITABLE'] = 5
        outrecord['5CDS'] = 1
        outrecord['3CDS'] = len(record.seq)
        outrecord['5PARTIAL'] = 'no'
        outrecord['3PARTIAL'] = 'yes'

    outrecord['ISOLATE'] = organism
    outrecord['COLDATE'] = coldate
    outrecord['SEQUENCE'] = record.seq

    log.debug(record.seq)
    log.debug(outrecord)
    output_list.append(outrecord)

with open(output, 'w') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=csv_fields, delimiter='\t')
    writer.writerow({'ENTRYNUMBER': '#template_accession ERT000020'})
    writer.writeheader()
    for data in output_list:
        writer.writerow(data)
