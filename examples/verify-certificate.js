/**
 * Example: Verify certificate with CSID
 *
 * Usage: node verify-certificate.js <requestId> <csid> <certificateId>
 */
const zatca = require('../lib');
const fs = require('fs').promises;
const path = require('path');

async function verifyCertificate(requestId, csid, certificateId) {
  try {
    console.log(`Verifying certificate for request ${requestId} with CSID ${csid}...`);

    // Verify certificate
    const response = await zatca.api.verifyCertificate(requestId, csid);

    if (!response.certificate) {
      console.error('No certificate in response from ZATCA');
      process.exit(1);
    }

    console.log('\nCertificate received from ZATCA');

    // Store certificate
    await zatca.certificate.storeCertificate(
      certificateId,
      response.certificate,
      'compliance'
    );

    console.log('\nCertificate verified and stored successfully!');
    console.log('You can now use this certificate for invoice submission');

    // Save compliance certificate to output directory
    const outputDir = path.join(__dirname, 'output');
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(
      path.join(outputDir, 'compliance-certificate.pem'),
      response.certificate
    );

    console.log('\nCertificate saved to examples/output/compliance-certificate.pem');
    console.log('\nNext step: Submit an invoice using:');
    console.log(`node submit-invoice.js ${certificateId}`);

    return response;
  } catch (error) {
    console.error('Failed to verify certificate:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  // Get command line arguments
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('Usage: node verify-certificate.js <requestId> <csid> <certificateId>');
    process.exit(1);
  }

  verifyCertificate(args[0], args[1], args[2]);
}

module.exports = verifyCertificate;