/**
 * QR Code Generation Implementation
 * @module zatca-phase2/qrcode/generate
 * @private
 */

const QRCode = require('qrcode');
const { ZatcaError, ErrorCodes } = require('../errors');
const logger = require('../utils/logger');
const tlv = require('./tlv');

/**
 * Generate QR code for an invoice
 * @function
 * @param {Object} invoice - Invoice object
 * @returns {Promise<string>} Base64 encoded QR code image
 */
exports.generateQRCode = async function(invoice) {
  try {
    logger.debug('Generating QR code for invoice', { invoiceNumber: invoice.invoiceNumber });

    // Generate TLV data
    const tlvData = tlv.generateTLVData(invoice);

    // Convert to base64
    const base64Data = Buffer.from(tlvData).toString('base64');

    // Generate QR code
    const qrCode = await new Promise((resolve, reject) => {
      QRCode.toDataURL(base64Data, {
        errorCorrectionLevel: 'M',
        margin: 0,
        width: 200
      }, (err, url) => {
        if (err) reject(err);
        else resolve(url);
      });
    });

    logger.debug('QR code generated successfully');

    return qrCode;
  } catch (error) {
    logger.error('Failed to generate QR code', { error: error.message });

    throw new ZatcaError(
      `Failed to generate QR code: ${error.message}`,
      ErrorCodes.QRCODE_GENERATION_ERROR
    );
  }
};