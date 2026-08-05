/**
 * Turn schema validation strings into short, actionable and user-friendly UI messages.
 */

const GENERIC_SERVER_ERROR = {
    field: "Submission",
    message:
        "Something went wrong while saving your submission. Please try again in a few moments. If the problem continues, please contact GFBio support.",
};

const NETWORK_ERROR = {
    field: "Submission",
    message:
        "We could not reach the server. Please check your internet connection and try again.",
};

const STATUS_LOCKED_ERROR = {
    field: "Submission",
    message:
        "This submission can no longer be edited because of its current status. If you need changes, please contact GFBio support.",
};

/**
 * Map a raw JSON-schema / backend message to user-facing text.
 * @param {string} rawMessage
 * @returns {string}
 */
export function humanizeValidationMessage(rawMessage) {
    if (!rawMessage || typeof rawMessage !== "string") {
        return "Please check this field and try again.";
    }

    const message = rawMessage.trim();
    const lower = message.toLowerCase();

    if (lower.includes("is not one of")) {
        return "The value you entered is not in the list of allowed options. Please choose a valid option from the field and try again.";
    }

    if (lower.includes("is a required property") || lower === "required") {
        return "This field is required. Please fill it in and try again.";
    }

    if (lower.includes("does not match") || lower.includes("pattern")) {
        return "The format of this value is not valid. Please check the expected format and try again.";
    }

    if (lower.includes("is too short") || lower.includes("shorter than")) {
        return "This value is too short. Please enter a longer value and try again.";
    }

    if (lower.includes("is too long") || lower.includes("longer than")) {
        return "This value is too long. Please shorten it and try again.";
    }

    if (lower.includes("is not of type")) {
        return "This value has the wrong type. Please correct it and try again.";
    }

    if (lower.includes("additional properties are not allowed")) {
        return "This field contains unexpected data. Please remove extra values and try again.";
    }

    if (lower.includes('pipe "|" character is not allowed') || lower.includes("pipe")) {
        return 'The "|" character is not allowed in contributor details. Please remove it and try again.';
    }

    if (lower.includes("earliest possible date")) {
        return "The embargo date must be at least 24 hours from today. Please pick a later date and try again.";
    }

    if (lower.includes("latest possible date")) {
        return "The embargo date cannot be more than 2 years from today. Please pick an earlier date and try again.";
    }

    if (lower.includes("no modifications allowed with current status")) {
        return STATUS_LOCKED_ERROR.message;
    }

    if (
        message.length < 180 &&
        !message.includes("is not one of") &&
        !message.includes("[")
    ) {
        const withPeriod = /[.!?]$/.test(message) ? message : `${message}.`;
        if (/please|try again|select|enter|choose|fill/i.test(message)) {
            return withPeriod;
        }
        return `${withPeriod} Please correct this and try again.`;
    }

    return "This field has an invalid value. Please correct it and try again.";
}

/**
 * Parse a backend item like "data_center : 'x' is not one of [...]".
 * @param {unknown} item
 * @param {(fieldId: string) => string} resolveFieldTitle
 * @returns {{ field: string, message: string }}
 */
export function humanizeApiDataItem(item, resolveFieldTitle) {
    if (typeof item !== "string") {
        return {
            field: "Submission",
            message: humanizeValidationMessage(String(item)),
        };
    }

    const colonIdx = item.indexOf(" : ");
    if (colonIdx === -1) {
        return {
            field: "Submission",
            message: humanizeValidationMessage(item),
        };
    }

    const fieldId = item.substring(0, colonIdx).trim();
    const rawMessage = item.substring(colonIdx + 3).trim();
    const fieldLabel =
        fieldId === "" || fieldId.toLowerCase() === "embargo"
            ? fieldId === ""
                ? "Submission"
                : "Embargo"
            : resolveFieldTitle(fieldId) || fieldId;

    // Contributors and Embargo prefixes sometimes appear as the "field" part
    if (/^contributors$/i.test(fieldId)) {
        return {
            field: "Contributors",
            message: humanizeValidationMessage(rawMessage || item),
        };
    }

    return {
        field: fieldLabel,
        message: humanizeValidationMessage(rawMessage || item),
    };
}

/**
 * Build ErrorBox entries from an axios-style error.
 * @param {unknown} error
 * @param {(fieldId: string) => string} resolveFieldTitle
 * @returns {{ field: string, message: string }[]}
 */
export function buildSubmissionErrorList(error, resolveFieldTitle) {
    if (!error?.response) {
        return [NETWORK_ERROR];
    }

    const responseData = error.response.data;
    const status = error.response.status;

    if (status === 401) {
        return [{
            field: "Submission",
            message: "Your session has expired. Please log in and then submit again.",
        }];
    }

    if (status === 403) {
        return [{
            field: "Submission",
            message: "You do not have permission to change this submission. If you think this is a mistake, please contact GFBio support.",
        }];
    }

    if (status === 404) {
        return [{
            field: "Submission",
            message: "This submission could not be found. Refresh the page or return to the submission list and try again.",
        }];
    }

    if (responseData?.data && Array.isArray(responseData.data)) {
        return responseData.data.map((item) =>
            humanizeApiDataItem(item, resolveFieldTitle),
        );
    }

    if (typeof responseData?.data === "string") {
        return [humanizeApiDataItem(responseData.data, resolveFieldTitle)];
    }

    if (typeof responseData?.error === "string") {
        return [{
            field: "Submission",
            message: humanizeValidationMessage(responseData.error),
        }];
    }

    // DRF-style field errors: { target: ["..."], embargo: ["..."] }
    if (responseData && typeof responseData === "object" && !Array.isArray(responseData)) {
        const fieldErrors = Object.entries(responseData).flatMap(([key, value]) => {
            if (key === "data" || key === "optional_validation") {
                return [];
            }
            const messages = Array.isArray(value) ? value : [value];
            return messages
                .filter((msg) => typeof msg === "string")
                .map((msg) => ({
                    field: resolveFieldTitle(key) || key,
                    message: humanizeValidationMessage(msg),
                }));
        });
        if (fieldErrors.length > 0) {
            return fieldErrors;
        }
    }

    return [GENERIC_SERVER_ERROR];
}

/**
 * Merge client and server ErrorBox entries by field label.
 * Client messages win on overlap (often more specific); server adds the rest.
 * @param {{ field: string, message: string }[]} clientErrors
 * @param {{ field: string, message: string }[]} serverErrors
 * @returns {{ field: string, message: string }[]}
 */
export function mergeErrorLists(clientErrors = [], serverErrors = []) {
    const byField = new Map();
    for (const error of serverErrors) {
        byField.set(error.field, error);
    }
    for (const error of clientErrors) {
        byField.set(error.field, error);
    }
    return Array.from(byField.values());
}

export { GENERIC_SERVER_ERROR, NETWORK_ERROR, STATUS_LOCKED_ERROR };
