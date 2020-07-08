import csv
import logging
import argparse
import os.path
from string import Template

parser = argparse.ArgumentParser(
    description="Read COGITO MAG metadata from CSV and prepare manifest files for ENA binned assembly submission.")
parser.add_argument("-d", "--debug", action="store_const", const=logging.DEBUG,
                    help="Enable debug messages in output. Sets the logging level to DEBUG.",
                    default=logging.WARNING)
parser.add_argument("-f", "--force-overwrite", action="store_true", dest="overwrite",
                    help="If the output directory is not empty, any files with the same"
                         "name will be overwritten without prompting for confirmation. default=False")
parser.add_argument("-i", "--input", action="store", required=True, type=argparse.FileType('r'),
                    help="Input CSV file with metadata.")
parser.add_argument("-c", "--coverage", action="store", required=False,
                    help="Input TSV file with coverage values for the MAGs.")
parser.add_argument("-o", "--output-dir", action="store", dest="outdir", default="manifest",
                    help="Path to output directory. Defaults to 'manifest' in the current directory.")
parser.add_argument("-s", "--skip-header", action="store_true", dest="header",
                    help="Skip the first line of the CSV. DEFAULT=False")

args = parser.parse_args()

# SET logging LEVEL
log = logging.getLogger('cogito')
logging.basicConfig(level=args.debug)

outdir = os.path.abspath(args.outdir)

if not os.path.exists(outdir):
    log.info("Output directory does not exist. Creating new directory: %s", outdir)
    os.makedirs(outdir)
for root, dirs, files in os.walk(outdir):
    if (files and not args.overwrite):
        # TODO: Add prompt http://code.activestate.com/recipes/577058/
        log.error("Output directory not empty: %s", outdir)
        exit(111)

log.debug("OUTPUT DIR: %s", outdir)

coverage_values = {}
if args.coverage:
    with open(args.coverage,'r') as cover:
        reader = csv.reader(cover,delimiter='\t')
        coverage_values = dict(reader)  # pull in each row as a key-value pair

log.debug(coverage_values)

manifest_template = Template('STUDY\tPRJEB28156\n'
                             'SAMPLE\t9b2a894e-2414-4ecf-a569-141a6057b21e:${mag_name}\n'
                             'ASSEMBLYNAME\t${mag_name}\n'
                             'PROGRAM\tanvi\'o and CONCOCT\n'
                             'COVERAGE\t${coverage}\n'
                             'ASSEMBLY_TYPE\tbinned metagenome\n'
                             'PLATFORM\tIllumina HiSeq 2000\n'
                             'MOLECULETYPE\tgenomic DNA\n'
                             'FASTA\t${fasta}\n'
                             )

reader = csv.reader(args.input, delimiter='\t')

if args.header:
    next(reader, None)  # skip the headers
    log.debug("Skipping header...")

for row in reader:

    if args.coverage:
        coverage = coverage_values[row[0]]
    else:
        coverage = row[10]
    manifest = manifest_template.substitute(mag_name=row[0], fasta=row[1], coverage=coverage)
    log.debug(manifest)

    with open(os.path.join(outdir, 'cogito-bin-' + row[0] + '.mf'), 'w') as outfile:
        outfile.write(manifest)
