/**
 * XML Generation Module
 * @module zatca-phase2/xml
 */

const invoice = require('./invoice');
const creditNote = require('./credit-note');

module.exports = {
  /**
     * Generate XML for an invoice
     * @function
     * @param {Object} invoice - Invoice object
     * @returns {string} XML string
     */
  generateInvoiceXml: invoice.generateInvoiceXml,

  /**
     * Generate XML for a credit note
     * @function
     * @param {Object} creditNote - Credit note object
     * @param {Object} originalInvoice - Original invoice object
     * @param {string} reason - Reason for credit note
     * @returns {string} XML string
     */
  generateCreditNoteXml: creditNote.generateCreditNoteXml,

  /**
     * Calculate hash for an invoice XML
     * @function
     * @param {string} xml - XML string
     * @returns {string} SHA-256 hash
     */
  calculateInvoiceHash: invoice.calculateInvoiceHash
};