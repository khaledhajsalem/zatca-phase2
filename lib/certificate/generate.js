/**
 * Certificate Generation Module
 * @module zatca-phase2/certificate/generate
 * @private
 */

const forge = require('node-forge');
const fs = require('fs').promises;
const config = require('config');
const logger = require('../utils/logger');
const { ZatcaError, ErrorCodes } = require('../errors');
const store = require('./store');

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
exports.generateCSR = async function(organization) {
  try {
    logger.info('Generating CSR for ZATCA compliance', { organization: organization.name });

    // Generate RSA key pair
    const keys = forge.pki.rsa.generateKeyPair(2048);

    // Convert to PKCS8 format for consistent format
    const privateKeyAsn1 = forge.pki.privateKeyToAsn1(keys.privateKey);
    const privateKeyInfo = forge.pki.wrapRsaPrivateKey(privateKeyAsn1);
    const privateKey = forge.pki.privateKeyInfoToPem(privateKeyInfo);

    const publicKey = forge.pki.publicKeyToPem(keys.publicKey);

    // Create CSR
    const csr = forge.pki.createCertificationRequest();

    // Set subject
    csr.subject.addField({ name: 'commonName', value: organization.name });
    csr.subject.addField({ name: 'organizationName', value: organization.name });
    csr.subject.addField({ name: 'organizationalUnitName', value: 'IT Department' });
    csr.subject.addField({ name: 'localityName', value: organization.city });
    csr.subject.addField({ name: 'stateOrProvinceName', value: organization.region });
    csr.subject.addField({ name: 'countryName', value: 'SA' });
    csr.subject.addField({ name: 'emailAddress', value: organization.email });

    // Set public key and sign CSR
    csr.publicKey = keys.publicKey;
    csr.sign(keys.privateKey);

    // Convert to PEM format
    const csrPem = forge.pki.certificationRequestToPem(csr);

    // Ensure certificate directory exists
    const certDir = config.get('certificate.storePath');
    await fs.mkdir(certDir, { recursive: true });

    // Generate certificate ID
    const certId = Date.now().toString();

    // Save CSR and keys
    await store.storeCertificate(certId, csrPem, 'csr');
    await store.storeCertificate(certId, privateKey, 'private');
    await store.storeCertificate(certId, publicKey, 'public');

    logger.info('CSR generation successful', { certificateId: certId });

    return {
      certificateId: certId,
      csr: csrPem,
      privateKey,
      publicKey
    };
  } catch (error) {
    logger.error('CSR generation failed', { error: error.message });
    throw new ZatcaError(
        `Failed to generate CSR: ${error.message}`,
        ErrorCodes.CERTIFICATE_GENERATION_ERROR
    );
  }
};