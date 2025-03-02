/**
 * Utility Functions Module
 * @module zatca-phase2/utils
 */

const validation = require('./validation');
const date = require('./date');

module.exports = {
  /**
   * Validate invoice data
   * @function
   * @param {Object} invoice - Invoice object
   * @throws {ZatcaError} Validation error
   */
  validateInvoice: validation.validateInvoice,

  /**
   * Validate certificate information
   * @function
   * @param {Object} certInfo - Certificate information
   * @throws {ZatcaError} Validation error
   */
  validateCertificate: validation.validateCertificate,

  /**
   * Format date to YYYY-MM-DD
   * @function
   * @param {Date} date - Date object
   * @returns {string} Formatted date
   */
  formatDate: date.formatDate,

  /**
   * Format time to HH:MM:SS
   * @function
   * @param {Date} date - Date object
   * @returns {string} Formatted time
   */
  formatTime: date.formatTime,

  /**
   * Format date and time to ISO8601 format
   * @function
   * @param {Date} date - Date object
   * @returns {string} Formatted date and time in ISO8601 format
   */
  formatISODateTime: date.formatISODateTime
};