/**
 * ZATCA Compliance API Implementation
 * @module zatca-phase2/api/compliance
 * @private
 */

const apiClient = require('./client');
const config = require('config');
const logger = require('../utils/logger');

/**
 * Request a compliance certificate
 * @function
 * @param {string} csrContent - CSR content
 * @returns {Promise<Object>} Response from ZATCA
 */
exports.requestComplianceCertificate = async function(csrContent) {
  logger.info('Requesting compliance certificate from ZATCA');

  const response = await apiClient.post(config.get('api.complianceUrl'), {
    csr: csrContent
  }, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  logger.info('Compliance certificate request successful', { requestId: response.data.requestID });

  return response.data;
};

/**
 * Verify certificate with CSID
 * @function
 * @param {string} requestId - Request ID
 * @param {string} csid - CSID received via email
 * @returns {Promise<Object>} Response from ZATCA
 */
exports.verifyCertificate = async function(requestId, csid) {
  logger.info('Verifying certificate with ZATCA', { requestId, csid });

  const response = await apiClient.post(`${config.get('api.complianceUrl')}/verify`, {
    requestID: requestId,
    csid: csid
  }, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  logger.info('Certificate verification successful', {
    requestId,
    hassCertificate: !!response.data.certificate
  });

  return response.data;
};