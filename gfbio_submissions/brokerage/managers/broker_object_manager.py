# -*- coding: utf-8 -*-
import csv
import json
import logging

from django.db import models

logger = logging.getLogger(__name__)


class BrokerObjectManager(models.Manager):
    def add_downloaded_pids_to_existing_broker_objects(self, study_pid, decompressed_file):
        entities_to_check = [
            "STUDY",
            "EXPERIMENT",
            "RUN",
            "SAMPLE",
        ]
        reader = csv.DictReader(decompressed_file, delimiter=str("\t"))
        reports = []

        for row in reader:
            if row.get("STUDY_ID", "") == study_pid:
                for entity in entities_to_check:
                    report = {}
                    entity_id = row.get("{0}_ID".format(entity), False)
                    entity_submitter_id = row.get("{0}_SUBMITTER_ID".format(entity), False)
                    report["action"] = "Checking {0} {1} {2}".format(entity, entity_id, entity_submitter_id)

                    broker_agent_ids = entity_submitter_id.split(":")
                    if len(broker_agent_ids) == 2:
                        broker_object_pk = broker_agent_ids[0]
                        request_id = broker_agent_ids[1]
                        try:
                            broker_object = self.get(pk=broker_object_pk)
                            report["found"] = "Brokerobject: {0}".format(broker_object)
                            pid, created = broker_object.get_or_create_ena_pid(entity_id, request_id)
                            report["result"] = "Persistent identifier: " "{0} created: " "{1}".format(pid.pid, created)
                        except self.model.DoesNotExist:
                            report["found"] = "No broker object with id/pk: " "{0}".format(broker_object_pk)
                    reports.append(report)
        return reports

    @staticmethod
    def process_experiment_file_block(experiment_data):
        files = [
            {
                "filename": experiment_data["files"].get("forward_read_file_name", "no_forward_file"),
                "filetype": "fastq",  # FIXME: hardcoded this
            }
        ]
        if "reverse_read_file_name" in experiment_data["files"]:
            files.append(
                {
                    "filename": experiment_data["files"].get("reverse_read_file_name", "no_forward_file"),
                    "filetype": "fastq",  # FIXME: hardcoded this
                }
            )
        if "forward_read_file_checksum" in experiment_data["files"]:
            files[0]["checksum_method"] = "MD5"  # FIXME: hardcoded this
            files[0]["checksum"] = experiment_data["files"]["forward_read_file_checksum"]
        if "reverse_read_file_checksum" in experiment_data["files"]:
            files[1]["checksum_method"] = "MD5"  # FIXME: hardcoded this
            files[1]["checksum"] = experiment_data["files"]["reverse_read_file_checksum"]
        data = {
            "experiment_ref": experiment_data.get("experiment_alias"),
            "data_block": {"files": files},
        }
        return data

    def add_file_entities(self, experiment_broker_object, submission):
        if experiment_broker_object.type == "experiment":
            if "files" in experiment_broker_object.data:
                data = self.process_experiment_file_block(experiment_broker_object.data)
                obj, created = self.update_or_create(
                    type="run",
                    user=experiment_broker_object.user,
                    object_id=experiment_broker_object.object_id,
                    defaults={"data": data},
                )
                obj.submissions.add(submission)

    def add_entity(self, submission, entity_type, user, json_data, object_id=""):
        obj, created = self.update_or_create(
            type=entity_type,
            user=user,
            object_id=object_id,
            defaults={"data": json_data},
        )
        # TODO: this was the fallback site_object_id to ensure the this
        #  function is not updating constantly but actually adding objects
        #   e.g. 5 x sample of uer1 == 1 x sample_user1
        # NOTE: sample_alias is required per jsonschema
        # NOTE:
        #       - here a entity with site_object_id='' was created, always, since none with '' exists
        #       - check below cause to add site_object_id, wich will be unique due to obj.pk
        #       - next iteration, again create with '' and so on
        # if obj.object_id == '':
        #     obj.object_id = '{0}_{1}'.format(obj.user, obj.pk)
        #     obj.save()
        obj.submissions.add(submission)
        return obj

    def add_submission_data(self, submission):
        if submission.release:
            if submission.target in ["ENA", "ENA_PANGAEA"]:
                self.add_ena_submission_data(submission)
            else:
                pass

    def add_study_only(self, submission):
        return self.add_entity(
            submission=submission,
            entity_type="study",
            user=submission.user,
            json_data={
                "study_title": submission.data["requirements"]["title"],
                "study_abstract": submission.data["requirements"]["description"],
            },
        )

    def add_ena_submission_data(self, submission):
        # TODO: check submission.data behaviour in this (new) python 3 environment
        if isinstance(submission.data, str):
            data = json.loads(submission.data)
        else:
            data = submission.data
        obj = self.add_entity(
            submission=submission,
            entity_type="study",
            user=submission.user,
            # site_project_id=submission.site_project_id,
            # site_object_id=data['requirements'].get('site_object_id', ''),
            json_data={
                "study_title": data["requirements"]["title"],
                "study_abstract": data["requirements"]["description"],
                # 'study_type': data['requirements']['study_type']
            },
        )

        # data['requirements']['site_object_id'] = obj.site_object_id
        for i in range(0, len(data["requirements"]["samples"])):
            # for sample in data['requirements']['samples']:
            sample = data["requirements"]["samples"][i]
            obj = self.add_entity(
                submission=submission,
                entity_type="sample",
                user=submission.user,
                # site_project_id=submission.site_project_id,
                # site_object_id=sample.get('site_object_id',
                # object_id=sample.get('sample_alias', ''),
                json_data=sample,
            )
            # data['requirements']['samples'][i][
            #     'site_object_id'] = obj.site_object_id

        for i in range(0, len(data["requirements"]["experiments"])):
            # for experiment in data['requirements']['experiments']:
            experiment = data["requirements"]["experiments"][i]
            obj = self.add_entity(
                submission=submission,
                entity_type="experiment",
                user=submission.user,
                json_data=experiment,
            )
            self.add_file_entities(experiment_broker_object=obj, submission=submission)

        if "runs" in data["requirements"].keys():
            for i in range(0, len(data["requirements"]["runs"])):
                run = data["requirements"]["runs"][i]
                obj = self.add_entity(
                    submission=submission,
                    entity_type="run",
                    user=submission.user,
                    json_data=run,
                )

        submission.data = data
        submission.save()

    # TODO: rename, since this here is mostly ena specific
    # TODO: refactor for generic solution
    def append_persistent_identifier(self, result, archive, pid_type, alias=None):
        if alias is None:
            alias = result.get("alias", "-1:-1").split(":")
        try:
            broker_obj = self.get(id=alias[0])
        except self.model.DoesNotExist:
            logger.error(
                msg="BrokerObject with id={} does not exist. "
                    "Failed to append_persistent_identifier for archive={} "
                    "of pid_type={}".format(alias[0], archive, pid_type)
            )
            return None
        logger.info(msg="append_persistent_identifier to pk={} of " "type={}.".format(broker_obj.id, broker_obj.type))
        return broker_obj.persistentidentifier_set.create(
            archive=archive,
            pid_type=pid_type,
            pid=result.get("accession", "-1"),
            outgoing_request_id=alias[1],
        )

    def append_persistent_identifiers(self, results, archive, pid_type, alias=None):
        return [self.append_persistent_identifier(r, archive, pid_type, alias) for r in results]

    def append_pids_from_ena_response(self, parsed_response):
        study = parsed_response.get("study", {})
        pids = [self.append_persistent_identifier(study, "ENA", "ACC")]
        for e in study.get("ext_ids", []):
            pids.append(
                self.append_persistent_identifier(e, "ENA", "PRJ", alias=study.get("alias", "-1:-1").split(":"))
            )

        for s in parsed_response.get("samples", []):
            pids.append(self.append_persistent_identifier(s, "ENA", "ACC"))
            for e in s.get("ext_ids", []):
                pids.append(
                    self.append_persistent_identifier(e, "ENA", "BSA", alias=s.get("alias", "-1:-1").split(":"))
                )
        pids.extend(self.append_persistent_identifiers(parsed_response.get("experiments", []), "ENA", "ACC"))
        pids.extend(self.append_persistent_identifiers(parsed_response.get("runs", []), "ENA", "ACC"))
        return pids

    def get_study_primary_accession_number(self, submission):
        study = self.filter(submissions__exact=submission, type="study").first()
        if not study:
            return None
        else:
            return study.persistentidentifier_set.filter(archive="ENA", pid_type="PRJ").first()
