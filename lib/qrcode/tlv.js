/**
 * TLV (Tag-Length-Value) Data Formatting
 * @module zatca-phase2/qrcode/tlv
 * @private
 */

const { formatISODateTime } = require('../utils/date');
const { ZatcaError, ErrorCodes } = require('../errors');
const logger = require('../utils/logger');

/**
 * Generate TLV (Tag-Length-Value) data for QR code
 * @function
 * @param {Object} invoice - Invoice object
 * @returns {Buffer} TLV data
 */
exports.generateTLVData = function(invoice) {
  try {
    logger.debug('Generating TLV data for QR code');

    const tlvParts = [];

    // Tag 1: Seller Name
    tlvParts.push(constructTLV(1, invoice.supplierName));

    // Tag 2: VAT Registration Number
    tlvParts.push(constructTLV(2, invoice.supplierTaxNumber));

    // Tag 3: Invoice Date and Time
    const timestamp = formatISODateTime(new Date(invoice.issueDate));
    tlvParts.push(constructTLV(3, timestamp));

    // Tag 4: Invoice Total (with VAT)
    tlvParts.push(constructTLV(4, invoice.totalAmount.toFixed(2)));

    // Tag 5: VAT Amount
    tlvParts.push(constructTLV(5, invoice.vatAmount.toFixed(2)));

    // If invoice is signed, add digital signature (Tag 6)
    if (invoice.signedXml) {
      // For simplicity, using hash as the signature
      // In production, extract actual signature value from XML
      tlvParts.push(constructTLV(6, invoice.hash || ''));
    }

    logger.debug('TLV data generated successfully');

    return Buffer.concat(tlvParts);
  } catch (error) {
    logger.error('Failed to generate TLV data', { error: error.message });

    throw new ZatcaError(
      `Failed to generate TLV data: ${error.message}`,
      ErrorCodes.QRCODE_GENERATION_ERROR
    );
  }
};

/**
 * Construct TLV (Tag-Length-Value) for a single field
 * @function
 * @param {number} tag - Tag number
 * @param {string} value - Field value
 * @returns {Buffer} TLV data
 * @private
 */
function constructTLV(tag, value) {
  // Convert tag to hex buffer (1 byte)
  const tagBuffer = Buffer.alloc(1);
  tagBuffer.writeUInt8(tag);

  // Convert value to buffer
  const valueBuffer = Buffer.from(value);

  // Get length (1 byte)
  const lengthBuffer = Buffer.alloc(1);
  lengthBuffer.writeUInt8(valueBuffer.length);

  // Combine tag, length, and value
  return Buffer.concat([tagBuffer, lengthBuffer, valueBuffer]);
}