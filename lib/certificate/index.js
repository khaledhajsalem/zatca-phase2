/**
 * ZATCA Certificate Management Module
 * @module zatca-phase2/certificate
 */

const generate = require('./generate');
const store = require('./store');

module.exports = {
  /**
     * Generate a Certificate Signing Request (CSR)
     * @function
     * @param {Object} organization - Organization details
     * @param {string} organization.name - Organization name
     * @param {string} organization.city - City
     * @param {string} organization.region - Region/State
     * @param {string} organization.email - Email address
     * @returns {Promise<Object>} CSR and private key
     */
  generateCSR: generate.generateCSR,

  /**
     * Store a certificate
     * @function
     * @param {string} certificateId - Certificate ID
     * @param {string} certificate - Certificate content
     * @param {string} type - Certificate type ('compliance' or 'production')
     * @returns {Promise<void>}
     */
  storeCertificate: store.storeCertificate,

  /**
     * Load a certificate
     * @function
     * @param {string} certificateId - Certificate ID
     * @param {string} type - Certificate type ('csr', 'private', 'public', 'compliance', 'production')
     * @returns {Promise<string>} Certificate content
     */
  loadCertificate: store.loadCertificate
};