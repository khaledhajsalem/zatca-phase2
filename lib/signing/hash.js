/**
 * Invoice Hash Calculation
 * @module zatca-phase2/signing/hash
 * @private
 */

const crypto = require('crypto');
const { ZatcaError, ErrorCodes } = require('../errors');
const logger = require('../utils/logger');

/**
 * Calculate hash for an invoice
 * @function
 * @param {Object} invoice - Invoice object
 * @param {string} invoiceXml - Invoice XML
 * @returns {string} SHA-256 hash
 */
exports.calculateInvoiceHash = function(invoice, invoiceXml) {
  try {
    logger.debug('Calculating invoice hash', { invoiceNumber: invoice.invoiceNumber });

    const hash = crypto.createHash('sha256').update(invoiceXml).digest('hex');

    // Update invoice object with hash
    invoice.hash = hash;

    logger.debug('Invoice hash calculated successfully', { hash });

    return hash;
  } catch (error) {
    logger.error('Failed to calculate invoice hash', { error: error.message });

    throw new ZatcaError(
      `Failed to calculate invoice hash: ${error.message}`,
      ErrorCodes.SIGNING_ERROR
    );
  }
};