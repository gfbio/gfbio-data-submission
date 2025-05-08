import axios from "axios";
import SparkMD5 from "spark-md5";
import { SUBMISSIONS_API } from "../settings.jsx";

async function calculateSHA256(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function calculateMD5(file) {
    const buffer = await file.arrayBuffer();
    return SparkMD5.ArrayBuffer.hash(buffer);
}

async function runWithConcurrency(tasks, concurrency) {
    const results = new Array(tasks.length);
    let index = 0;

    async function worker() {
        while (index < tasks.length) {
            const currentIndex = index;
            index++;

            //TODO: add try catch for this if needs to be caught
            results[currentIndex] = await tasks[currentIndex]();
        }
    }

    const workers = [];
    for (let i = 0; i < concurrency; i++) {
        workers.push(worker());
    }
    await Promise.all(workers);

    return results;
}

export async function uploadFileToS3(
    file,
    brokerSubmissionId,
    attach_to_ticket,
    meta_data,
    token,
    onProgress,
    partSize = 100 * 1024 * 1024,
    maxWorkers = 5,
    maxRetries = 3,
) {
    const totalParts = Math.ceil(file.size / partSize);
    const fileType = file.type || "application/octet-stream";

    const [md5, sha256] = await Promise.all([
        calculateMD5(file),
        calculateSHA256(file),
    ]);

    const startResponse = await axios.post(
        `${SUBMISSIONS_API}${brokerSubmissionId}/cloudupload/`,
        {
            filename: file.name,
            filetype: fileType,
            total_size: file.size,
            part_size: partSize,
            total_parts: totalParts,
            meta_data: meta_data,
            attach_to_ticket: attach_to_ticket,
            md5: md5,
            sha256: sha256,
        },
        {
            headers: {
                Authorization: "Token " + token,
                "Content-Type": "application/json",
            },
        },
    );
    const { upload_id } = startResponse.data;
    const completedParts = [];

    const tasks = [];
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * partSize;
        const end = Math.min(file.size, partNumber * partSize);
        tasks.push(() => uploadOnePartWithRetry(
            file,
            fileType,
            partNumber,
            start,
            end,
            upload_id,
            onProgress,
            maxRetries,
            totalParts,
            token,
        ));
    }

    const results = await runWithConcurrency(tasks, maxWorkers);
    for (let i = 0; i < results.length; i++) {
        const { partNumber, etag } = results[i];
        completedParts.push({
            PartNumber: partNumber,
            ETag: etag,
        });
    }

    completedParts.sort((a, b) => a.PartNumber - b.PartNumber);
    await axios.put(
        `${SUBMISSIONS_API}cloudupload/${upload_id}/complete/`,
        { parts: completedParts },
        {
            headers: {
                Authorization: "Token " + token,
                "Content-Type": "application/json",
            },
        },
    );

    return {
        upload_id,
        fileName: file.name,
    };
}

async function uploadOnePartWithRetry(
    file,
    fileType,
    partNumber,
    start,
    end,
    upload_id,
    onProgress,
    maxRetries,
    totalParts,
    token,
) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const etag = await uploadOnePart(
                file,
                fileType,
                partNumber,
                start,
                end,
                upload_id,
                onProgress,
                totalParts,
                token,
            );
            return { partNumber, etag };
        } catch (error) {
            lastError = error;
            console.warn(
                `Retrying part #${partNumber}, attempt ${attempt}/${maxRetries}, error: ${error}`,
            );
            if (attempt === maxRetries) {
                throw error;
            }
        }
    }
    throw lastError;
}

async function uploadOnePart(
    file,
    fileType,
    partNumber,
    start,
    end,
    upload_id,
    onProgress,
    totalParts,
    token,
) {
    const partResponse = await axios.post(
        `${SUBMISSIONS_API}cloudupload/${upload_id}/part/`,
        {
            part_number: partNumber,
        },
        {
            headers: {
                Authorization: "Token " + token,
                "Content-Type": "application/json",
            },
        },
    );

    const { presigned_url } = partResponse.data;
    const blob = file.slice(start, end);
    const arrayBuffer = await blob.arrayBuffer();
    const md5 = SparkMD5.ArrayBuffer.hash(arrayBuffer);
    const s3Response = await axios.put(presigned_url, blob, {
        headers: { "Content-Type": fileType },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const fractionOfPart = progressEvent.loaded / (end - start);
                const naivePercent = Math.floor(
                    ((partNumber - 1) + fractionOfPart) / totalParts * 100,
                );
                onProgress(file, naivePercent);
            }
        },
    });

    const etag = s3Response.headers.etag.replace(/"/g, "");
    if (etag !== md5) {
        throw new Error(`ETag does not match MD5 hash for part ${partNumber}`);
    }

    await axios.put(
        `${SUBMISSIONS_API}cloudupload/${upload_id}/update-part/`,
        {
            part_number: partNumber,
            etag,
            completed: true,
        },
        {
            headers: {
                Authorization: "Token " + token,
                "Content-Type": "application/json",
            },
        },
    );

    return etag;
}
