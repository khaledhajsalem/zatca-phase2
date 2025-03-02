/**
 * Example: Generate CSR and request compliance certificate
 */
const zatca = require('../lib');
const fs = require('fs').promises;
const path = require('path');

async function generateCertificate() {
  try {
    console.log('Generating CSR for ZATCA compliance...');

    // Organization details
    const organization = {
      name: 'Your Company Name',
      city: 'Riyadh',
      region: 'Riyadh Region',
      email: 'your@email.com'
    };

    // Generate CSR
    const certInfo = await zatca.certificate.generateCSR(organization);

    console.log('CSR generated successfully!');
    console.log('Certificate ID:', certInfo.certificateId);
    console.log('\nCSR Content:');
    console.log(certInfo.csr);

    // Save certificate ID for later use
    const outputDir = path.join(__dirname, 'output');
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, 'certificate-id.txt'), certInfo.certificateId);

    console.log('\nCertificate ID saved to examples/output/certificate-id.txt');

    // Request compliance certificate from ZATCA
    console.log('\nRequesting certificate from ZATCA...');
    const response = await zatca.api.requestComplianceCertificate(certInfo.csr);

    if (!response.requestID) {
      console.error('Failed to get request ID from ZATCA');
      process.exit(1);
    }

    // Save request ID for verification
    await fs.writeFile(path.join(outputDir, 'request-id.txt'), response.requestID);

    console.log('\nRequest submitted to ZATCA successfully!');
    console.log('Request ID:', response.requestID);
    console.log('Request ID saved to examples/output/request-id.txt');
    console.log('\nPlease check your email for the CSID from ZATCA and then run:');
    console.log(`node verify-certificate.js ${response.requestID} <csid> ${certInfo.certificateId}`);

    return certInfo;
  } catch (error) {
    console.error('Failed to generate certificate:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateCertificate();
}

module.exports = generateCertificate;