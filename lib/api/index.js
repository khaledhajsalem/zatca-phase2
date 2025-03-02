/**
 * ZATCA API Integration Module
 * @module zatca-phase2/api
 */

const client = require('./client');
const compliance = require('./compliance');
const reporting = require('./reporting');
const clearance = require('./clearance');

module.exports = {
  /**
     * HTTP client for direct API access (advanced usage)
     */
  client,

  /**
     * Request a compliance certificate
     * @function
     * @param {string} csrContent - CSR content
     * @returns {Promise<Object>} Response from ZATCA
     */
  requestComplianceCertificate: compliance.requestComplianceCertificate,

  /**
     * Verify certificate with CSID
     * @function
     * @param {string} requestId - Request ID
     * @param {string} csid - CSID received via email
     * @returns {Promise<Object>} Response from ZATCA
     */
  verifyCertificate: compliance.verifyCertificate,

  /**
     * Clear an invoice (for invoices >= 1000 SAR)
     * @function
     * @param {Object} invoice - Invoice object
     * @param {string} signedXml - Signed XML
     * @param {Object} certificate - Certificate info
     * @returns {Promise<Object>} Response from ZATCA
     */
  clearInvoice: clearance.clearInvoice,

  /**
     * Report an invoice (for invoices < 1000 SAR)
     * @function
     * @param {Object} invoice - Invoice object
     * @param {string} signedXml - Signed XML
     * @param {Object} certificate - Certificate info
     * @returns {Promise<Object>} Response from ZATCA
     */
  reportInvoice: reporting.reportInvoice,

  /**
     * Check status of an invoice
     * @function
     * @param {string} requestId - Request ID
     * @returns {Promise<Object>} Response from ZATCA
     */
  checkInvoiceStatus: reporting.checkInvoiceStatus
};