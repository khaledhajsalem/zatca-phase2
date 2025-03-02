/**
 * Example: Create credit note for an invoice
 *
 * Usage: node create-credit-note.js <certificateId> <originalInvoiceNumber>
 */
const zatca = require('../lib');
const fs = require('fs').promises;
const path = require('path');

async function createCreditNote(certificateId, originalInvoiceNumber, amount = 1150) {
  try {
    console.log(`Creating credit note for invoice ${originalInvoiceNumber}...`);

    // Create a mock original invoice (in real scenario, you would fetch it from your database)
    const originalInvoice = {
      uuid: '12345678-1234-1234-1234-123456789012', // This would be the real UUID
      invoiceNumber: originalInvoiceNumber,
      issueDate: new Date(Date.now() - 86400000), // Yesterday
      supplyDate: new Date(Date.now() - 86400000),
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

    // Reason for credit note
    const reason = 'Customer returned the product';

    // Certificate information
    const certInfo = {
      certificateId: certificateId,
      type: 'compliance',
      token: 'your-auth-token' // You would get this from authentication
    };

    // Generate XML for credit note
    console.log('Generating credit note XML...');
    const { creditNote } = await zatca.invoice.createCreditNote(originalInvoice, reason, certInfo);

    console.log('\nCredit note created:');
    console.log('Credit Note Number:', creditNote.invoiceNumber);
    console.log('Total Amount:', creditNote.totalAmount);
    console.log('VAT Amount:', creditNote.vatAmount);

    // Save credit note XML
    const outputDir = path.join(__dirname, 'output');
    await fs.mkdir(outputDir, { recursive: true });
    if (creditNote.signedXml) {
      await fs.writeFile(path.join(outputDir, 'credit-note.xml'), creditNote.signedXml);
      console.log('\nCredit note XML saved to examples/output/credit-note.xml');
    }

    // Generate QR code for credit note
    console.log('Generating QR code for credit note...');
    const qrCode = await zatca.qrcode.generateQRCode(creditNote);

    // Save QR code
    await fs.writeFile(path.join(outputDir, 'credit-note-qr.txt'), qrCode);
    console.log('QR code saved to examples/output/credit-note-qr.txt');

    console.log('\nCredit note process completed successfully!');

    return creditNote;
  } catch (error) {
    console.error('Failed to create credit note:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  // Get parameters from command line
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node create-credit-note.js <certificateId> <originalInvoiceNumber> [amount]');
    process.exit(1);
  }

  const amount = args[2] ? parseFloat(args[2]) : 1150;
  createCreditNote(args[0], args[1], amount);
}

module.exports = createCreditNote;