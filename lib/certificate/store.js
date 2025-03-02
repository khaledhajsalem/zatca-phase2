/**
 * Certificate Storage Module
 * @module zatca-phase2/certificate/store
 * @private
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('config');
const logger = require('../utils/logger');
const { ZatcaError, ErrorCodes } = require('../errors');

/**
 * Store a certificate
 * @function
 * @param {string} certificateId - Certificate ID
 * @param {string} certificate - Certificate content
 * @param {string} type - Certificate type ('csr', 'private', 'public', 'compliance', 'production')
 * @returns {Promise<void>}
 */
exports.storeCertificate = async function(certificateId, certificate, type) {
  try {
    logger.debug(`Storing ${type} certificate`, { certificateId });

    const certDir = config.get('certificate.storePath');
    await fs.mkdir(certDir, { recursive: true });

    const filePath = path.join(certDir, `${type}_${certificateId}.pem`);
    await fs.writeFile(filePath, certificate);

    logger.debug('Certificate stored successfully', { certificateId, type, filePath });
  } catch (error) {
    logger.error('Certificate storage failed', {
      certificateId,
      type,
      error: error.message
    });

    throw new ZatcaError(
      `Failed to store ${type} certificate: ${error.message}`,
      ErrorCodes.CERTIFICATE_STORAGE_ERROR
    );
  }
};

/**
 * Load a certificate
 * @function
 * @param {string} certificateId - Certificate ID
 * @param {string} type - Certificate type ('csr', 'private', 'public', 'compliance', 'production')
 * @returns {Promise<string>} Certificate content
 */
exports.loadCertificate = async function(certificateId, type) {
  try {
    logger.debug(`Loading ${type} certificate`, { certificateId });

    const certDir = config.get('certificate.storePath');
    const filePath = path.join(certDir, `${type}_${certificateId}.pem`);

    const content = await fs.readFile(filePath, 'utf8');

    logger.debug('Certificate loaded successfully', { certificateId, type });

    return content;
  } catch (error) {
    logger.error('Certificate loading failed', {
      certificateId,
      type,
      error: error.message
    });

    throw new ZatcaError(
      `Failed to load ${type} certificate: ${error.message}`,
      ErrorCodes.CERTIFICATE_LOADING_ERROR
    );
  }
};