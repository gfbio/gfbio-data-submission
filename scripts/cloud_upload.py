# -*- coding: utf-8 -*-
import argparse
import concurrent.futures
import logging
import mimetypes
import os
from dataclasses import dataclass
from typing import List, Dict, Optional
from timeit import default_timer as timer
import math
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class UploadConfig:
    api_base_url: str
    broker_submission_id: str
    auth_token: str
    part_size: int = 5 * 1024 * 1024  # 5MB default part size
    max_retries: int = 3
    max_workers: int = 5


@dataclass
class UploadPart:
    part_number: int
    start_byte: int
    end_byte: int
    etag: Optional[str] = None
    completed: bool = False


class SubmissionCloudUploadClient:
    def __init__(self, config: UploadConfig):
        self.config = config
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Token {config.auth_token}'
        })

    @staticmethod
    def _get_content_type(filename: str) -> str:
        content_type, _ = mimetypes.guess_type(filename)
        return content_type or 'application/octet-stream'

    def _initialize_upload(self, file_path: str, file_size: int) -> Dict:
        file_name = os.path.basename(file_path)
        total_parts = math.ceil(file_size / self.config.part_size)

        data = {
            'filename': file_name,
            'filetype': self._get_content_type(file_name),
            'total_size': file_size,
            'part_size': self.config.part_size,
            'total_parts': total_parts
        }

        response = self.session.post(
            f"{self.config.api_base_url}/api/submissions/{self.config.broker_submission_id}/cloudupload/",
            json=data
        )
        response.raise_for_status()
        return response.json()

    def _prepare_parts(self, file_size: int) -> List[UploadPart]:
        parts = []
        part_number = 1

        for start_byte in range(0, file_size, self.config.part_size):
            end_byte = min(start_byte + self.config.part_size, file_size)
            parts.append(UploadPart(
                part_number=part_number,
                start_byte=start_byte,
                end_byte=end_byte
            ))
            part_number += 1

        return parts

    def _upload_single_part(self, file, part: UploadPart, upload_id: str) -> str:
        logger.info(f"\t\tuploading part no. {part.part_number}")
        response = self.session.post(
            f"{self.config.api_base_url}/api/submissions/cloudupload/{upload_id}/part/",
            json={'part_number': part.part_number}
        )
        response.raise_for_status()
        presigned_url = response.json()['presigned_url']

        file.seek(part.start_byte)
        part_data = file.read(part.end_byte - part.start_byte)

        response = requests.put(presigned_url, data=part_data)
        response.raise_for_status()

        logger.info(f"\t\tdone uploading part no. {part.part_number}")
        # print('responise gheasder ', response.headers)
        # # TODO: OPTIONAL
        # update_response = self.session.put(
        #     f"{self.config.api_base_url}/api/submissions/cloudupload/{upload_id}/update-part/",
        #     json={'part_number': part.part_number, "etag": response.headers['ETag'].strip('"')}
        # )
        # print(update_response.content)
        return response.headers['ETag'].strip('"')

    def _upload_part_with_retry(self, file, part: UploadPart, upload_id: str) -> str:
        for attempt in range(self.config.max_retries):
            try:
                etag = self._upload_single_part(file, part, upload_id)
                # TODO: OPTIONAL
                update_response = self.session.put(
                    f"{self.config.api_base_url}/api/submissions/cloudupload/{upload_id}/update-part/",
                    json={'part_number': part.part_number, "etag": etag, "completed": True}
                )
                print(update_response.content)
                return etag
            except Exception as e:
                if attempt == self.config.max_retries - 1:
                    raise
                logger.warning(
                    f"Retrying part {part.part_number} after error: {str(e)}"
                )

    def _upload_parts(self, file, parts: List[UploadPart], upload_id: str) -> List[Dict]:
        completed_parts = []

        with concurrent.futures.ThreadPoolExecutor(max_workers=self.config.max_workers) as executor:
            # Create futures for all parts
            future_to_part = {
                executor.submit(
                    self._upload_part_with_retry,
                    file,
                    part,
                    upload_id
                ): part for part in parts
            }

            # Process completed futures
            for future in concurrent.futures.as_completed(future_to_part):
                part = future_to_part[future]
                try:
                    etag = future.result()
                    completed_parts.append({
                        'PartNumber': part.part_number,
                        'ETag': etag
                    })
                except Exception as e:
                    raise Exception(f"Failed to upload part {part.part_number}: {str(e)}")

        return sorted(completed_parts, key=lambda x: x['PartNumber'])

    def _complete_upload(self, upload_id: str, parts: List[Dict]) -> Dict:
        logger.info("\tcomplete upload ...")
        print('PARTS ', parts)
        response = self.session.put(
            f"{self.config.api_base_url}/api/submissions/cloudupload/{upload_id}/complete/",
            json={'parts': parts}
        )
        response.raise_for_status()
        print('response json ', response.json())
        return response.json()

    def _abort_upload(self, upload_id: str):
        try:
            self.session.delete(
                f"{self.config.api_base_url}/api/submissions/cloudupload/{upload_id}/abort/"
            )
        except Exception as e:
            logger.error(f"Failed to abort upload: {str(e)}")

    def upload_file(self, file_path: str) -> Dict:
        try:
            file_size = os.path.getsize(file_path)
            file_name = os.path.basename(file_path)

            logger.info("\tinitialize upload")
            upload_data = self._initialize_upload(file_path, file_size)
            upload_id = upload_data['upload_id']

            logger.info("\tprepare parts")
            parts = self._prepare_parts(file_size)

            logger.info(f"\tstart uploading {len(parts)} parts")
            with open(file_path, 'rb') as file:
                completed_parts = self._upload_parts(file, parts, upload_id)

            return self._complete_upload(upload_id, completed_parts)

        except Exception as e:
            logger.error(f"Upload failed: {str(e)}")
            if 'upload_id' in locals():
                self._abort_upload(upload_id)
            raise


# Example usage
if __name__ == "__main__":

    start = timer()

    parser = argparse.ArgumentParser(description='Upload a file using multipart upload')
    parser.add_argument('file_path', help='Path to the file to upload')
    parser.add_argument('--broker-submission-id', required=True,
                        help='Broker Submission ID of submission corresponding to the SubmisisonCloudUpload to be created')
    parser.add_argument('--api-url', required=True, help='Base API URL')
    parser.add_argument('--token', required=True, help='Authentication token')
    parser.add_argument('--part-size', type=int, default=5 * 1024 * 1024,
                        help='Part size Megabyte. Enter an integer, defaults to 5 (will be calculated to bytes e.g. 5*1024*1024)')
    parser.add_argument('--max-workers', type=int, default=5,
                        help='Maximum number of concurrent uploads')

    args = parser.parse_args()

    part_size_in_bytes = args.part_size * 1024 ** 2
    # print(part_size_in_bytes)
    # print(type(part_size_in_bytes))
    config = UploadConfig(
        api_base_url=args.api_url,
        broker_submission_id=args.broker_submission_id,
        auth_token=args.token,
        part_size=part_size_in_bytes,
        max_workers=args.max_workers
    )

    uploader = SubmissionCloudUploadClient(config)

    try:
        logger.info(f"Starting upload of {args.file_path}")
        result = uploader.upload_file(args.file_path)
        logger.info(f"Upload completed successfully: {result}")
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        exit(1)
    end = timer()
    seconds = (end - start)
    minutes = math.ceil(seconds / 60)
    logger.info(f'ELAPSED TIME: {seconds} seconds. -> ca. {minutes} minutes')
    # head -c 25M /dev/urandom > testfile-25M.bin
