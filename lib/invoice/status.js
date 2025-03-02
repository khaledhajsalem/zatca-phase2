/**
 * Invoice Status Module
 * @module zatca-phase2/invoice/status
 * @private
 */

const { ZatcaError, ErrorCodes } = require('../errors');
const logger = require('../utils/logger');
const api = require('../api');

/**
 * Check status of a submitted invoice
 * @function
 * @param {Object} invoice - Invoice with zatcaResponse
 * @returns {Promise<Object>} Updated status
 */
exports.checkInvoiceStatus = async function(invoice) {
  try {
    logger.info('Checking invoice status', {
      invoiceNumber: invoice.invoiceNumber
    });

    if (!invoice.zatcaResponse || !invoice.zatcaResponse.requestID) {
      throw new ZatcaError(
        'Invoice has no valid ZATCA response with requestID',
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const requestId = invoice.zatcaResponse.requestID;
    logger.debug('Found request ID', { requestId });

    const statusResponse = await api.checkInvoiceStatus(requestId);

    // Update invoice status
    invoice.zatcaStatus = statusResponse.status || 'unknown';

    logger.info('Invoice status updated', {
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.zatcaStatus
    });

    return statusResponse;
  } catch (error) {
    logger.error('Failed to check invoice status', {
      invoiceNumber: invoice.invoiceNumber,
      error: error.message
    });

    if (error.name === 'ZatcaError') {
      throw error;
    }

    throw new ZatcaError(
      `Failed to check invoice status: ${error.message}`,
      ErrorCodes.UNKNOWN_ERROR
    );
  }
};