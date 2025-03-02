/**
 * Example: Submit invoice to ZATCA
 *
 * Usage: node submit-invoice.js <certificateId>
 */
const zatca = require('../lib');
const fs = require('fs').promises;
const path = require('path');

async function submitInvoice(certificateId, amount = 1150) {
  try {
    console.log('Preparing invoice for ZATCA submission...');

    // Sample invoice data
    const invoice = {
      invoiceNumber: `INV-${Date.now()}`,
      issueDate: new Date(),
      supplyDate: new Date(),
      supplierName: 'Your Company Name',
      supplierTaxNumber: '123456789012345',
      customerName: 'Customer XYZ',
      customerTaxNumber: '987654321098765',
      totalAmount: amount,
      vatAmount: amount * 0.15,
      items: [
        {
          name: 'Product A',
          quantity: 1,
          unitPrice: amount * 0.85,
          taxRate: 15,
          taxAmount: amount * 0.15,
          totalAmount: amount
        }
      ]
    };

    // Certificate information (in a real scenario, you would have an auth token)
    const certInfo = {
      certificateId: certificateId,
      type: 'compliance',
      token: 'your-auth-token' // You would get this from authentication
    };

    // Generate XML
    console.log('Generating invoice XML...');
    const invoiceXml = zatca.xml.generateInvoiceXml(invoice);

    // Calculate hash
    console.log('Calculating invoice hash...');
    const hash = zatca.signing.calculateInvoiceHash(invoice, invoiceXml);
    console.log('Invoice hash:', hash);

    // Sign XML
    console.log('Signing invoice XML...');
    const signedXml = await zatca.signing.signInvoice(invoice, invoiceXml, certInfo);

    // Save the signed XML for reference
    const outputDir = path.join(__dirname, 'output');
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, 'signed-invoice.xml'), signedXml);
    console.log('Signed XML saved to examples/output/signed-invoice.xml');

    // Generate QR code
    console.log('Generating QR code...');
    const qrCode = await zatca.qrcode.generateQRCode(invoice);

    // Save QR code image
    await fs.writeFile(path.join(outputDir, 'invoice-qr.txt'), qrCode);
    console.log('QR code saved to examples/output/invoice-qr.txt');

    // Submit to ZATCA (commented out to avoid actual API calls)
    /*
        console.log('Submitting invoice to ZATCA...');
        const response = await zatca.invoice.submitInvoice(invoice, certInfo);

        console.log('Invoice submitted successfully!');
        console.log('Response:', response);

        // Save request ID for status check
        await fs.writeFile(path.join(outputDir, 'invoice-request-id.txt'), response.requestID);
        console.log('Request ID saved to examples/output/invoice-request-id.txt');

        console.log('\nNext step: Check invoice status using:');
        console.log(`node check-invoice-status.js ${response.requestID}`);

        return response;
        */

    // This is a simulation instead of actual API call
    console.log('\nSimulation completed successfully!');
    console.log('In a real scenario, the invoice would be submitted to ZATCA');
    console.log('The XML and QR code are generated and ready for use');

    return {
      success: true,
      invoice,
      xml: invoiceXml,
      signedXml,
      qrCode
    };
  } catch (error) {
    console.error('Failed to submit invoice:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  // Get certificate ID from command line
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: node submit-invoice.js <certificateId> [amount]');
    process.exit(1);
  }

  const amount = args[1] ? parseFloat(args[1]) : 1150;
  submitInvoice(args[0], amount);
}

module.exports = submitInvoice;