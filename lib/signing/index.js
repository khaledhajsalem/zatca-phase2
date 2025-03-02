/**
 * XML Signing Module
 * @module zatca-phase2/signing
 */

const sign = require('./sign');
const hash = require('./hash');

module.exports = {
  /**
     * Sign an invoice XML
     * @function
     * @param {Object} invoice - Invoice object
     * @param {string} invoiceXml - Invoice XML string
     * @param {Object} certInfo - Certificate information
     * @returns {Promise<string>} Signed XML
     */
  signInvoice: sign.signInvoice,

  /**
     * Calculate hash for an invoice
     * @function
     * @param {Object} invoice - Invoice object
     * @param {string} invoiceXml - Invoice XML
     * @returns {string} SHA-256 hash
     */
  calculateInvoiceHash: hash.calculateInvoiceHash
};