/**
 * Example: Check invoice status
 *
 * Usage: node check-invoice-status.js <requestId>
 */
const zatca = require('../lib');

async function checkInvoiceStatus(requestId) {
  try {
    console.log(`Checking status for invoice request ${requestId}...`);

    // Create mock invoice object with zatcaResponse
    const invoice = {
      invoiceNumber: 'unknown', // We don't need the actual invoice number for status check
      zatcaResponse: { requestID: requestId }
    };

    // Check status
    const statusResponse = await zatca.invoice.checkInvoiceStatus(invoice);

    console.log('\nInvoice status check successful!');
    console.log('Status:', invoice.zatcaStatus);
    console.log('Full response:', statusResponse);

    return statusResponse;
  } catch (error) {
    console.error('Failed to check invoice status:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  // Get request ID from command line
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: node check-invoice-status.js <requestId>');
    process.exit(1);
  }

  checkInvoiceStatus(args[0]);
}

module.exports = checkInvoiceStatus;