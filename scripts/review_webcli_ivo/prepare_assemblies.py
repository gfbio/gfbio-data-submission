import csv
import logging
import optparse
import os.path
from jinja2 import Template

# from string import Template
# import sys

parser = optparse.OptionParser()
parser.add_option("-d", "--debug", action="store_true", dest="debug",
                  help="Enable debug messages in output. Sets the logging level to DEBUG.", default=False)
parser.add_option("-i", "--input", action="store", dest="input",
                  help="Input table with metadata.")
parser.add_option("-o", "--output-dir", action="store", dest="outdir",
                  help="Path to output directory. Defaults to invocation directory.")

(options, args) = parser.parse_args()

# SET logging LEVEL
log = logging.getLogger('cogito')
if options.debug:
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.ERROR)

if options.outdir:
    output_dir = options.outdir
else:
    output_dir = 'manifest'

# log.debug(sys.path)


template = Template('STUDY\tPRJEB28156\n'
                    'SAMPLE\t{{ sample }}\n'
                    'ASSEMBLYNAME\tCOGITO-PRIMARY-ASSEMBLY-{{ date }}\n'
                    'PROGRAM\tSPades v3.10\n'
                    'COVERAGE\t{{ coverage }}\n'
                    'ASSEMBLY_TYPE\tprimary metagenome\n'
                    'PLATFORM\tIllumina HiSeq 2000\n'
                    'MOLECULETYPE\tgenomic DNA\n'
                    'FASTA\t{{ fasta }}\n'
                    )

with open(options.input, 'r') as assembly_metadata:
    reader = csv.reader(assembly_metadata, delimiter=',')

    for row in reader:
        log.debug(row)
        manifest = template.render(date=row[0],coverage=row[5],sample=row[2],fasta=row[4])
        log.debug(manifest)

        with open(os.path.join(output_dir, 'cogito-' + row[0] + '.mf'), 'w') as outfile:
            outfile.write(manifest)
