/**
 * ZATCA Error Handling Module
 * @module zatca-phase2/errors
 */

const zatcaError = require('./zatca-error');

module.exports = {
  /**
     * Custom error class for ZATCA operations
     * @class
     */
  ZatcaError: zatcaError.ZatcaError,

  /**
     * Error codes for different types of errors
     * @enum {string}
     */
  ErrorCodes: zatcaError.ErrorCodes
};