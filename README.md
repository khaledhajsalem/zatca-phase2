# ZATCA Phase 2 Integration for Node.js

A comprehensive Node.js library for integrating with the ZATCA (Zakat, Tax and Customs Authority) Phase 2 e-invoicing system in Saudi Arabia, providing robust and efficient backend support for e-invoicing operations.

## Features

- Certificate generation and management
- XML generation compliant with ZATCA standards
- QR code generation for invoices
- Digital signing of invoices
- Integration with ZATCA APIs (compliance, reporting, clearance)
- Invoice status verification
- Credit note generation

## Installation

```bash
npm install zatca-phase2
```

## Configuration

Create a configuration file or use environment variables:

```env
ZATCA_ORG_NAME=Your Company Name
ZATCA_TAX_NUMBER=Your VAT Registration Number
ZATCA_PRODUCTION=false
ZATCA_PIH=Your Production Integration Handler
LOG_LEVEL=info
```

## Quick Start

```javascript
const zatca = require('zatca-phase2');

// Generate CSR
async function generateCSR() {
  const organization = {
    name: 'Your Company Name',
    city: 'Riyadh',
    region: 'Riyadh Region',
    email: 'your@email.com'
  };
  
  const certInfo = await zatca.generateCSR(organization);
  console.log('CSR generated:', certInfo.csr);
  return certInfo;
}

// Submit invoice
async function submitInvoice(certificateId) {
  const invoice = {
    invoiceNumber: 'INV-123',
    issueDate: new Date(),
    supplierName: 'Your Company',
    supplierTaxNumber: '123456789012345',
    customerName: 'Customer',
    customerTaxNumber: '987654321098765',
    totalAmount: 115.00,
    vatAmount: 15.00,
    items: [
      {
        name: 'Product',
        quantity: 1,
        unitPrice: 100.00,
        taxRate: 15,
        taxAmount: 15.00,
        totalAmount: 115.00
      }
    ]
  };
  
  const certInfo = {
    certificateId: certificateId,
    type: 'compliance',
    token: 'your-auth-token'
  };
  
  const response = await zatca.submitInvoice(invoice, certInfo);
  console.log('Invoice submitted:', response);
}

// Generate QR code
async function generateQRCode(invoice) {
  const qrCode = await zatca.generateQRCode(invoice);
  console.log('QR code generated:', qrCode);
  return qrCode;
}
```

## Complete Integration Flow

The typical integration flow with ZATCA consists of the following steps:

1. **Onboarding**:
   - Generate CSR (Certificate Signing Request)
   - Submit CSR to ZATCA compliance API
   - Receive CSID via email
   - Verify certificate with CSID
   - Store compliance certificate

2. **Invoice Processing**:
   - Create invoice data
   - Generate invoice XML
   - Sign XML using compliance certificate
   - Submit for clearance (invoices ≥ 1000 SAR) or reporting (invoices < 1000 SAR)
   - Process ZATCA response
   - Generate QR code for the invoice

3. **Post-Processing**:
   - Check invoice status
   - Create credit notes if needed

## API Documentation

### Certificate Management

- `zatca.certificate.generateCSR(organization)` - Generate a Certificate Signing Request
- `zatca.certificate.storeCertificate(certificateId, certificate, type)` - Store a certificate
- `zatca.certificate.loadCertificate(certificateId, type)` - Load a certificate

### API Integration

- `zatca.api.requestComplianceCertificate(csrContent)` - Request compliance certificate
- `zatca.api.verifyCertificate(requestId, csid)` - Verify certificate with CSID
- `zatca.api.clearInvoice(invoice, signedXml, certificate)` - Clear an invoice
- `zatca.api.reportInvoice(invoice, signedXml, certificate)` - Report an invoice
- `zatca.api.checkInvoiceStatus(requestId)` - Check invoice status

### XML Generation

- `zatca.xml.generateInvoiceXml(invoice)` - Generate XML for an invoice
- `zatca.xml.generateCreditNoteXml(creditNote, originalInvoice, reason)` - Generate XML for a credit note
- `zatca.xml.calculateInvoiceHash(xml)` - Calculate hash for an invoice XML

### Signing

- `zatca.signing.signInvoice(invoice, invoiceXml, certInfo)` - Sign an invoice XML
- `zatca.signing.calculateInvoiceHash(invoice, invoiceXml)` - Calculate hash for an invoice

### QR Code

- `zatca.qrcode.generateQRCode(invoice)` - Generate QR code for an invoice

### Invoice Processing

- `zatca.invoice.submitInvoice(invoice, certInfo)` - Process and submit an invoice to ZATCA
- `zatca.invoice.checkInvoiceStatus(invoice)` - Check status of a submitted invoice
- `zatca.invoice.createCreditNote(originalInvoice, reason, certInfo)` - Create a credit note for an invoice

## Project Structure

```
zatca-phase2/
├── lib/                          # Core library code
│   ├── api/                      # API integration
│   │   ├── client.js             # HTTP client implementation
│   │   ├── compliance.js         # Compliance API methods
│   │   ├── reporting.js          # Reporting API methods
│   │   ├── clearance.js          # Clearance API methods
│   │   └── index.js              # API module exports
│   ├── certificate/              # Certificate management
│   │   ├── generate.js           # CSR generation
│   │   ├── store.js              # Certificate storage
│   │   └── index.js              # Certificate module exports
│   ├── invoice/                  # Invoice processing
│   │   ├── submit.js             # Invoice submission
│   │   ├── status.js             # Status checking
│   │   ├── credit-note.js        # Credit note generation
│   │   └── index.js              # Invoice module exports
│   ├── qrcode/                   # QR code generation
│   │   ├── generate.js           # QR code generation
│   │   ├── tlv.js                # TLV data formatting
│   │   └── index.js              # QR code module exports
│   ├── signing/                  # XML signing
│   │   ├── sign.js               # XML signing implementation
│   │   ├── hash.js               # Hash calculation
│   │   └── index.js              # Signing module exports
│   ├── xml/                      # XML generation
│   │   ├── invoice.js            # Invoice XML generation
│   │   ├── credit-note.js        # Credit note XML generation
│   │   └── index.js              # XML module exports
│   ├── utils/                    # Utility functions
│   │   ├── date.js               # Date formatting utilities
│   │   ├── validation.js         # Data validation
│   │   ├── logger.js             # Logging utilities
│   │   └── index.js              # Utils module exports
│   ├── errors/                   # Error handling
│   │   ├── zatca-error.js        # Custom error classes
│   │   └── index.js              # Errors module exports
│   └── index.js                  # Main library entry point
├── config/                       # Configuration
│   └── default.js                # Default configuration
├── examples/                     # Example usage scripts
│   ├── generate-certificate.js   # Certificate generation example
│   ├── verify-certificate.js     # Certificate verification example
│   ├── submit-invoice.js         # Invoice submission example
│   ├── check-invoice-status.js   # Status checking example
│   └── create-credit-note.js     # Credit note example
├── test/                         # Test suite
│   ├── unit/                     # Unit tests
│   │   ├── api.test.js           # API tests
│   │   ├── certificate.test.js   # Certificate tests
│   │   └── xml.test.js           # XML tests
│   └── setup.js                  # Test setup
├── scripts/                      # Build scripts
│   └── build.js                  # Build script
├── LICENSE                       # MIT License
├── README.md                     # Documentation
├── package.json                  # Package manifest
├── .eslintrc.js                  # ESLint configuration
├── jsdoc.json                    # JSDoc configuration
└── .gitignore                    # Git ignore file
```

## Error Handling

The library uses custom `ZatcaError` class for error handling:

```javascript
try {
  await zatca.submitInvoice(invoice, certInfo);
} catch (error) {
  if (error.name === 'ZatcaError') {
    console.error(`Error code: ${error.code}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error details:`, error.details);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Examples

### Certificate Generation

```javascript
const zatca = require('zatca-phase2');
const fs = require('fs').promises;

async function onboarding() {
  try {
    // Generate CSR
    const certInfo = await zatca.certificate.generateCSR({
      name: 'Your Company Name',
      city: 'Riyadh',
      region: 'Riyadh Region',
      email: 'your@email.com'
    });
    
    console.log('CSR generated with ID:', certInfo.certificateId);
    console.log('CSR content:', certInfo.csr);
    
    // Request compliance certificate
    const response = await zatca.api.requestComplianceCertificate(certInfo.csr);
    console.log('Request ID:', response.requestID);
    
    // Save request ID for later verification
    await fs.writeFile('request-id.txt', response.requestID);
    
    console.log('Please check your email for CSID and run the verification step');
  } catch (error) {
    console.error('Onboarding failed:', error);
  }
}

async function verifyCertificate() {
  try {
    // Read saved request ID
    const requestId = await fs.readFile('request-id.txt', 'utf8');
    
    // Get CSID from user
    const csid = process.argv[2];
    if (!csid) {
      console.error('Please provide CSID as argument');
      process.exit(1);
    }
    
    // Get certificate ID
    const certificateId = process.argv[3];
    if (!certificateId) {
      console.error('Please provide certificate ID as argument');
      process.exit(1);
    }
    
    // Verify certificate
    const response = await zatca.api.verifyCertificate(requestId, csid);
    
    // Store certificate
    await zatca.certificate.storeCertificate(
      certificateId,
      response.certificate,
      'compliance'
    );
    
    console.log('Certificate verified and stored successfully!');
  } catch (error) {
    console.error('Verification failed:', error);
  }
}
```

### Invoice Submission

```javascript
const zatca = require('zatca-phase2');
const fs = require('fs').promises;

async function submitInvoice() {
   try {
      // Prepare invoice data
      const invoice = {
         invoiceNumber: `INV-${Date.now()}`,
         issueDate: new Date(),
         supplierName: 'Your Company',
         supplierTaxNumber: '123456789012345',
         customerName: 'Customer XYZ',
         customerTaxNumber: '987654321098765',
         totalAmount: 1150.00,
         vatAmount: 150.00,
         items: [
            {
               name: 'Product A',
               quantity: 1,
               unitPrice: 1000.00,
               taxRate: 15,
               taxAmount: 150.00,
               totalAmount: 1150.00
            }
         ]
      };

      // Get certificate ID
      const certificateId = process.argv[2];
      if (!certificateId) {
         console.error('Please provide certificate ID as argument');
         process.exit(1);
      }

      // Certificate info
      const certInfo = {
         certificateId: certificateId,
         type: 'compliance',
         token: 'your-auth-token'
      };

      // Submit invoice
      const response = await zatca.submitInvoice(invoice, certInfo);

      console.log('Invoice submitted successfully!');
      console.log('Request ID:', response.requestID);

      // Generate QR code
      const qrCode = await zatca.generateQRCode(invoice);
      console.log('QR code generated:', qrCode.substring(0, 50) + '...');

      // Save request ID for later status check
      await fs.writeFile('invoice-request-id.txt', response.requestID);
   } catch (error) {
      console.error('Invoice submission failed:', error);
   }
}

async function checkInvoiceStatus() {
   try {
      // Read saved request ID
      const requestId = await fs.readFile('invoice-request-id.txt', 'utf8');

      // Create invoice object with zatcaResponse
      const invoice = {
         zatcaResponse: { requestID: requestId }
      };

      // Check status
      const statusResponse = await zatca.invoice.checkInvoiceStatus(invoice);

      console.log('Invoice status:', statusResponse.status);
      console.log('Full response:', statusResponse);
   } catch (error) {
      console.error('Status check failed:', error);
   }
}
```

## ZATCA Compliance Requirements

This library implements the technical requirements specified in the ZATCA e-invoicing Phase 2 documentation, including:

1. Generation of compliant e-invoices in XML format
2. Digital signing of invoices
3. QR code generation for simplified invoices
4. Integration with ZATCA's APIs:
   - Compliance (onboarding)
   - Clearance (for invoices ≥ 1000 SAR)
   - Reporting (for invoices < 1000 SAR)

## License

MIT
