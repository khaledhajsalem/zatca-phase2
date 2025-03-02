/**
 * Credit Note Module
 * @module zatca-phase2/invoice/credit-note
 * @private
 */

const { v4: uuidv4 } = require('uuid');
const { ZatcaError, ErrorCodes } = require('../errors');
const logger = require('../utils/logger');
const xml = require('../xml');
const signing = require('../signing');
const api = require('../api');

/**
 * Create a credit note for an invoice
 * @function
 * @param {Object} originalInvoice - Original invoice
 * @param {string} reason - Reason for credit note
 * @param {Object} certInfo - Certificate information
 * @returns {Promise<Object>} Credit note and ZATCA response
 */
exports.createCreditNote = async function(originalInvoice, reason, certInfo) {
  try {
    logger.info('Creating credit note for invoice', {
      originalInvoiceNumber: originalInvoice.invoiceNumber
    });

    // Create credit note object
    const creditNote = {
      uuid: uuidv4(),
      invoiceNumber: `CN-${originalInvoice.invoiceNumber}`,
      issueDate: new Date(),
      supplyDate: new Date(),
      supplierName: originalInvoice.supplierName,
      supplierTaxNumber: originalInvoice.supplierTaxNumber,
      customerName: originalInvoice.customerName,
      customerTaxNumber: originalInvoice.customerTaxNumber,
      totalAmount: -Math.abs(originalInvoice.totalAmount),
      vatAmount: -Math.abs(originalInvoice.vatAmount),
      items: originalInvoice.items.map(item => ({
        ...item,
        quantity: -Math.abs(item.quantity),
        totalAmount: -Math.abs(item.totalAmount),
        taxAmount: -Math.abs(item.taxAmount)
      }))
    };

    logger.debug('Credit note object created', {
      creditNoteNumber: creditNote.invoiceNumber
    });

    // Generate XML for credit note
    const creditNoteXml = xml.generateCreditNoteXml(creditNote, originalInvoice, reason);
    logger.debug('Credit note XML generated');

    // Calculate hash
    const hash = signing.calculateInvoiceHash(creditNote, creditNoteXml);
    logger.debug('Credit note hash calculated', { hash });

    // Sign XML
    const signedXml = await signing.signInvoice(creditNote, creditNoteXml, certInfo);
    logger.debug('Credit note XML signed');

    // Store signed XML in credit note object
    creditNote.signedXml = signedXml;

    // Submit to ZATCA (always reported, not cleared)
    const response = await api.reportInvoice(creditNote, signedXml, certInfo);

    // Update credit note status
    creditNote.zatcaStatus = 'submitted';
    creditNote.zatcaResponse = response;

    logger.info('Credit note submitted successfully', {
      creditNoteNumber: creditNote.invoiceNumber,
      requestId: response.requestID
    });

    return {
      creditNote,
      response
    };
  } catch (error) {
    logger.error('Failed to create credit note', {
      originalInvoiceNumber: originalInvoice.invoiceNumber,
      error: error.message
    });

    if (error.name === 'ZatcaError') {
      throw error;
    }

    throw new ZatcaError(
      `Failed to create credit note: ${error.message}`,
      ErrorCodes.UNKNOWN_ERROR
    );
  }
};