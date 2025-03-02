/**
 * ZATCA Clearance API Implementation
 * @module zatca-phase2/api/clearance
 * @private
 */

const apiClient = require('./client');
const config = require('config');
const logger = require('../utils/logger');

/**
 * Clear an invoice (for invoices >= 1000 SAR)
 * @function
 * @param {Object} invoice - Invoice object
 * @param {string} signedXml - Signed XML
 * @param {Object} certificate - Certificate info
 * @returns {Promise<Object>} Response from ZATCA
 */
exports.clearInvoice = async function(invoice, signedXml, certificate) {
  logger.info('Clearing invoice with ZATCA', {
    invoiceNumber: invoice.invoiceNumber,
    uuid: invoice.uuid
  });

  const response = await apiClient.post(config.get('api.clearanceUrl'), {
    invoiceHash: invoice.hash,
    uuid: invoice.uuid,
    invoice: Buffer.from(signedXml).toString('base64')
  }, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${certificate.token}`
    }
  });

  logger.info('Invoice clearance successful', {
    invoiceNumber: invoice.invoiceNumber,
    uuid: invoice.uuid,
    requestId: response.data.requestID
  });

  return response.data;
};