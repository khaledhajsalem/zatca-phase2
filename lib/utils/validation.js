/**
 * Data Validation Utility
 * @module zatca-phase2/utils/validation
 * @private
 */

const { ZatcaError, ErrorCodes } = require('../errors');

/**
 * Validate invoice data
 * @function
 * @param {Object} invoice - Invoice object
 * @throws {ZatcaError} Validation error
 */
exports.validateInvoice = function(invoice) {
  const requiredFields = [
    'invoiceNumber',
    'issueDate',
    'supplierName',
    'supplierTaxNumber',
    'customerName',
    'totalAmount',
    'vatAmount'
  ];

  const missingFields = requiredFields.filter(field => !invoice[field]);

  if (missingFields.length > 0) {
    throw new ZatcaError(
      `Missing required invoice fields: ${missingFields.join(', ')}`,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  if (!Array.isArray(invoice.items) || invoice.items.length === 0) {
    throw new ZatcaError(
      'Invoice must have at least one item',
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // Validate items
  invoice.items.forEach((item, index) => {
    const requiredItemFields = ['name', 'quantity', 'unitPrice', 'taxRate', 'taxAmount', 'totalAmount'];
    const missingItemFields = requiredItemFields.filter(field => item[field] === undefined);

    if (missingItemFields.length > 0) {
      throw new ZatcaError(
        `Missing required fields in item ${index + 1}: ${missingItemFields.join(', ')}`,
        ErrorCodes.VALIDATION_ERROR
      );
    }
  });
};

/**
 * Validate certificate information
 * @function
 * @param {Object} certInfo - Certificate information
 * @throws {ZatcaError} Validation error
 */
exports.validateCertificate = function(certInfo) {
  const requiredFields = ['certificateId', 'type'];

  const missingFields = requiredFields.filter(field => !certInfo[field]);

  if (missingFields.length > 0) {
    throw new ZatcaError(
      `Missing required certificate fields: ${missingFields.join(', ')}`,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  if (!['compliance', 'production'].includes(certInfo.type)) {
    throw new ZatcaError(
      'Certificate type must be either "compliance" or "production"',
      ErrorCodes.VALIDATION_ERROR
    );
  }
};