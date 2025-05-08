/**
 * Formats a date object to YYYY-MM-DD string without timezone conversion
 * @param {Date} date - The date to format
 * @returns {string} The formatted date string
 */
export function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
} 