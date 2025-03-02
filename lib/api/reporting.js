/**
 * ZATCA Reporting API Implementation
 * @module zatca-phase2/api/reporting
 * @private
 */

const apiClient = require('./client');
const config = require('config');
const logger = require('../utils/logger');

/**
 * Report an invoice (for invoices < 1000 SAR)
 * @function
 * @param {Object} invoice - Invoice object
 * @param {string} signedXml - Signed XML
 * @param {Object} certificate - Certificate info
 * @returns {Promise<Object>} Response from ZATCA
 */
exports.reportInvoice = async function(invoice, signedXml, certificate) {
  logger.info('Reporting invoice to ZATCA', {
    invoiceNumber: invoice.invoiceNumber,
    uuid: invoice.uuid
  });

  const response = await apiClient.post(config.get('api.reportingUrl'), {
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

  logger.info('Invoice reporting successful', {
    invoiceNumber: invoice.invoiceNumber,
    uuid: invoice.uuid,
    requestId: response.data.requestID
  });

  return response.data;
};

/**
 * Check status of a reported or cleared invoice
 * @function
 * @param {string} requestId - Request ID
 * @returns {Promise<Object>} Response from ZATCA
 */
exports.checkInvoiceStatus = async function(requestId) {
  logger.info('Checking invoice status', { requestId });

  const response = await apiClient.get(`${config.get('api.statusUrl')}/${requestId}`, {
    headers: {
      'Accept': 'application/json'
    }
  });

  logger.info('Invoice status check successful', {
    requestId,
    status: response.data.status
  });

  return response.data;
};