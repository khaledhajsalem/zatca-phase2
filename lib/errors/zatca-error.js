/**
 * ZATCA Error Module
 * @module zatca-phase2/errors/zatca-error
 * @private
 */

/**
 * Custom error class for ZATCA operations
 * @class
 * @extends Error
 */
class ZatcaError extends Error {
  /**
     * Creates a new ZatcaError
     * @param {string} message - Error message
     * @param {string} code - Error code from ErrorCodes
     * @param {*} [details=null] - Additional error details
     */
  constructor(message, code, details = null) {
    super(message);
    this.name = 'ZatcaError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Error codes for different types of errors
 * @enum {string}
 */
const ErrorCodes = {
  // API errors
  API_ERROR: 'API_ERR',
  API_CONNECTION_ERROR: 'API_CONN_ERR',
  API_REQUEST_ERROR: 'API_REQ_ERR',

  // Certificate errors
  CERTIFICATE_GENERATION_ERROR: 'CERT_GEN_ERR',
  CERTIFICATE_STORAGE_ERROR: 'CERT_STORAGE_ERROR',
  CERTIFICATE_LOADING_ERROR: 'CERT_LOADING_ERROR',

  // XML errors
  XML_GENERATION_ERROR: 'XML_GEN_ERR',
  XML_PARSING_ERROR: 'XML_PARSE_ERR',

  // Signing errors
  SIGNING_ERROR: 'SIGN_ERR',

  // QR code errors
  QRCODE_GENERATION_ERROR: 'QR_GEN_ERR',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERR',

  // Unknown error
  UNKNOWN_ERROR: 'UNKNOWN_ERR'
};

module.exports = {
  ZatcaError,
  ErrorCodes
};