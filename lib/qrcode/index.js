/**
 * QR Code Generation Module
 * @module zatca-phase2/qrcode
 */

const generate = require('./generate');
const tlv = require('./tlv');

module.exports = {
  /**
     * Generate QR code for an invoice
     * @function
     * @param {Object} invoice - Invoice object
     * @returns {Promise<string>} Base64 encoded QR code image
     */
  generateQRCode: generate.generateQRCode,

  /**
     * Generate TLV (Tag-Length-Value) data for QR code
     * @function
     * @param {Object} invoice - Invoice object
     * @returns {Buffer} TLV data
     */
  generateTLVData: tlv.generateTLVData
};