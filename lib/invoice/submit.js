/**
 * Invoice Submission Module
 * @module zatca-phase2/invoice/submit
 * @private
 */

const { v4: uuidv4 } = require('uuid');
const config = require('config');
const { ZatcaError, ErrorCodes } = require('../errors');
const logger = require('../utils/logger');
const xml = require('../xml');
const signing = require('../signing');
const api = require('../api');
const { validateInvoice, validateCertificate } = require('../utils/validation');

/**
 * Process and submit an invoice to ZATCA
 * @function
 * @param {Object} invoice - Invoice object
 * @param {Object} certInfo - Certificate information
 * @returns {Promise<Object>} ZATCA response
 */
exports.submitInvoice = async function(invoice, certInfo) {
  try {
    logger.info('Starting invoice submission process', {
      invoiceNumber: invoice.invoiceNumber
    });

    // Validate inputs
    validateInvoice(invoice);
    validateCertificate(certInfo);

    // Ensure invoice has a UUID
    if (!invoice.uuid) {
      invoice.uuid = uuidv4();
      logger.debug('Generated UUID for invoice', { uuid: invoice.uuid });
    }

    // Generate XML if not already done
    let invoiceXml = invoice.xml;
    if (!invoiceXml) {
      invoiceXml = xml.generateInvoiceXml(invoice);
      invoice.xml = invoiceXml;
      logger.debug('Invoice XML generated');
    }

    // Calculate hash if not already done
    if (!invoice.hash) {
      signing.calculateInvoiceHash(invoice, invoiceXml);
      logger.debug('Invoice hash calculated', { hash: invoice.hash });
    }

    // Sign XML if not already signed
    let signedXml = invoice.signedXml;
    if (!signedXml) {
      signedXml = await signing.signInvoice(invoice, invoiceXml, certInfo);
      invoice.signedXml = signedXml;
      logger.debug('Invoice XML signed');
    }

    // Determine whether to use clearance or reporting based on threshold
    const clearanceThreshold = config.get('clearanceThreshold');
    logger.debug('Checking clearance threshold', {
      totalAmount: invoice.totalAmount,
      threshold: clearanceThreshold
    });

    let response;
    if (parseFloat(invoice.totalAmount) >= clearanceThreshold) {
      // Clearance
      logger.info('Clearing invoice (amount >= threshold)', {
        amount: invoice.totalAmount,
        threshold: clearanceThreshold
      });

      response = await api.clearInvoice(invoice, signedXml, certInfo);

      // Set clearance status
      invoice.clearanceStatus = 'submitted';
    } else {
      // Reporting
      logger.info('Reporting invoice (amount < threshold)', {
        amount: invoice.totalAmount,
        threshold: clearanceThreshold
      });

      response = await api.reportInvoice(invoice, signedXml, certInfo);
    }

    // Update invoice status
    invoice.zatcaStatus = 'submitted';
    invoice.zatcaResponse = response;

    logger.info('Invoice submitted successfully', {
      invoiceNumber: invoice.invoiceNumber,
      requestId: response.requestID
    });

    return response;
  } catch (error) {
    logger.error('Failed to submit invoice', {
      invoiceNumber: invoice.invoiceNumber,
      error: error.message,
      stack: error.stack
    });

    if (error.name === 'ZatcaError') {
      throw error;
    }

    throw new ZatcaError(
      `Failed to submit invoice: ${error.message}`,
      ErrorCodes.UNKNOWN_ERROR,
      error
    );
  }
};