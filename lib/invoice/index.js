/**
 * Invoice Processing Module
 * @module zatca-phase2/invoice
 */

const submit = require('./submit');
const status = require('./status');
const creditNote = require('./credit-note');

module.exports = {
  /**
     * Process and submit an invoice to ZATCA
     * @function
     * @param {Object} invoice - Invoice object
     * @param {Object} certInfo - Certificate information
     * @returns {Promise<Object>} ZATCA response
     */
  submitInvoice: submit.submitInvoice,

  /**
     * Check status of a submitted invoice
     * @function
     * @param {Object} invoice - Invoice with zatcaResponse
     * @returns {Promise<Object>} Updated status
     */
  checkInvoiceStatus: status.checkInvoiceStatus,

  /**
     * Create a credit note for an invoice
     * @function
     * @param {Object} originalInvoice - Original invoice
     * @param {string} reason - Reason for credit note
     * @param {Object} certInfo - Certificate information
     * @returns {Promise<Object>} Credit note and ZATCA response
     */
  createCreditNote: creditNote.createCreditNote
};