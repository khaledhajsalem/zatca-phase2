/**
 * XML Signing Implementation
 * @module zatca-phase2/signing/sign
 * @private
 */

const { SignedXml } = require('xml-crypto');
const { ZatcaError, ErrorCodes } = require('../errors');
const logger = require('../utils/logger');
const certificate = require('../certificate');

/**
 * Sign an invoice XML
 * @function
 * @param {Object} invoice - Invoice object
 * @param {string} invoiceXml - Invoice XML string
 * @param {Object} certInfo - Certificate information
 * @returns {Promise<string>} Signed XML
 */
exports.signInvoice = async function(invoice, invoiceXml, certInfo) {
  try {
    logger.debug('Signing invoice XML', {
      invoiceNumber: invoice.invoiceNumber,
      certificateId: certInfo.certificateId
    });

    // Load private key and certificate
    const privateKey = await certificate.loadCertificate(certInfo.certificateId, 'private');
    const cert = await certificate.loadCertificate(certInfo.certificateId, certInfo.type);

    // Create signature
    const sig = new SignedXml();

    // Set signing key
    sig.signingKey = privateKey;

    // Add certificate
    sig.keyInfoProvider = {
      getKeyInfo: () => {
        return `<X509Data><X509Certificate>${cert.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\n/g, '')}</X509Certificate></X509Data>`;
      }
    };

    // Configure signature - determine the element based on document type
    const rootElement = invoiceXml.includes('<CreditNote') ? 'CreditNote' : 'Invoice';

    sig.addReference(
        `//*[local-name(.)='${rootElement}']`,
        [
          'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
          'http://www.w3.org/2001/10/xml-exc-c14n#'
        ],
        'http://www.w3.org/2001/04/xmlenc#sha256'
    );

    sig.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';
    sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';

    // Load document and compute signature
    sig.computeSignature(invoiceXml);

    // Get signed XML
    const signedXml = sig.getSignedXml();

    logger.debug('XML signed successfully');

    return signedXml;
  } catch (error) {
    logger.error('Failed to sign invoice XML', { error: error.message });

    throw new ZatcaError(
        `Failed to sign invoice: ${error.message}`,
        ErrorCodes.SIGNING_ERROR
    );
  }
};