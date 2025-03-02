/**
 * Date Utility Functions
 * @module zatca-phase2/utils/date
 * @private
 */

/**
 * Format date to YYYY-MM-DD
 * @function
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
exports.formatDate = function(date) {
  return date.toISOString().substring(0, 10);
};

/**
 * Format time to HH:MM:SS
 * @function
 * @param {Date} date - Date object
 * @returns {string} Formatted time
 */
exports.formatTime = function(date) {
  return date.toISOString().substring(11, 19);
};

/**
 * Format date and time to ISO8601 format
 * @function
 * @param {Date} date - Date object
 * @returns {string} Formatted date and time in ISO8601 format
 */
exports.formatISODateTime = function(date) {
  return date.toISOString().replace(/\.\d+Z$/, 'Z');
};