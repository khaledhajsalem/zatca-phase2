/**
 * ZATCA Phase 2 Integration Library
 * @module zatca-phase2
 */

const api = require('./api');
const certificate = require('./certificate');
const invoice = require('./invoice');
const qrcode = require('./qrcode');
const signing = require('./signing');
const xml = require('./xml');
const errors = require('./errors');
const utils = require('./utils');

/**
 * ZATCA Phase 2 Integration module
 * @type {Object}
 */
module.exports = {
  /**
     * API integration methods
     */
  api,

  /**
     * Certificate management methods
     */
  certificate,

  /**
     * Invoice processing methods
     */
  invoice,

  /**
     * QR code generation methods
     */
  qrcode,

  /**
     * XML signing methods
     */
  signing,

  /**
     * XML generation methods
     */
  xml,

  /**
     * Error classes and utilities
     */
  errors,

  /**
     * Utility functions
     */
  utils,

  /**
     * Library version
     */
  version: require('../package.json').version,

  /**
     * Convenience methods
     */

  /**
     * Generate CSR for ZATCA compliance
     * @param {Object} organization - Organization details
     * @returns {Promise<Object>} Certificate information
     */
  generateCSR: certificate.generateCSR,

  /**
     * Submit an invoice to ZATCA
     * @param {Object} invoice - Invoice details
     * @param {Object} certInfo - Certificate information
     * @returns {Promise<Object>} ZATCA response
     */
  submitInvoice: invoice.submitInvoice,

  /**
     * Generate QR code for an invoice
     * @param {Object} invoice - Invoice details
     * @returns {Promise<string>} QR code data URL
     */
  generateQRCode: qrcode.generateQRCode
};