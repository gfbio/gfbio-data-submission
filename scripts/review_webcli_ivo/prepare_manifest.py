import argparse
import csv
import logging


parser = argparse.ArgumentParser("This script does the following:"
                                 "1. Read a CSV TEMPLATE with assembly infos"
                                 "2. For each line, write a manifst file, using the first column as filename with the suffix '.mf'"
                                 )

parser.add_argument("-d", "--debug", action="store_const", const=logging.DEBUG,
                    default=logging.INFO,
                    help="Enable debug messages in output. Sets the logging level to DEBUG.")
parser.add_argument("-i", "--input-csv", action="store", dest="input",
                    help="Read metadata from CSV", required=True)


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

with open(args.input) as csvfile:
    log.debug("Opening input file: {}".format(args.input))
    reader = csv.reader(csvfile)
    headers = next(reader, None)
    log.debug("TSV headers: {}".format(headers))
    for row in reader:
        entry = dict(zip(headers, row))
        log.debug(entry)
        with open(entry['sample_title'] + '.mf','w') as f:
            writer = csv.writer(f, delimiter='\t')
            writer.writerow(["STUDY"] + ["PRJEB34624"])
            writer.writerow(["SAMPLE"] + [entry['INSDC_SAMPLE_ID']])
            writer.writerow(["ASSEMBLYNAME"] + [entry['sample_title']])
            writer.writerow(["ASSEMBLY_TYPE"] + ["clone or isolate"])
            writer.writerow(["COVERAGE"] + [entry["COVERAGE"]])
            writer.writerow(["PROGRAM"] + [entry["PROGRAM"]])
            writer.writerow(["PLATFORM"] + [entry["PLATFORM"]])
            writer.writerow(["MOLECULETYPE"] + [entry["MOLECULE_TYPE"]])
            writer.writerow(["FLATFILE"] + [entry["FILE_NAME"]+".gz"])
            # writer.writerow(["RUN_REF"] + ["ERR"])
            writer.writerow(["AUTHORS"] + ["Yui Sato;"])
            writer.writerow(["ADDRESS"] + ["Max Planck Institute for Marine Microbiology, Celsiusstrasse 1, 28359 Bremen, Germany"])

            #for k,v in entry.items():
            #    writer.writerow([k] + [v])
