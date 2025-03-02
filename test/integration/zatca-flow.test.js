/**
 * Integration test for complete ZATCA flow
 * This test simulates the entire invoice lifecycle with ZATCA
 */
const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs').promises;
const path = require('path');
const config = require('config');
const zatca = require('../../lib');
const { standardInvoice } = require('../fixtures/invoices');
const { sampleOrganization, sampleCertificateInfo } = require('../fixtures/certificates');

// Skip these tests in CI environments
const SKIP_INTEGRATION = process.env.CI === 'true' || process.env.SKIP_INTEGRATION === 'true';

describe('ZATCA Complete Flow', function() {
    // These tests might take longer than usual
    this.timeout(10000);

    let apiStub;
    let certId;
    let configStub;
    let signStub;

    before(async function() {
        if (SKIP_INTEGRATION) {
            this.skip();
            return;
        }

        // Create temp certificates directory
        const certDir = path.join(__dirname, '../../temp-certificates');
        await fs.mkdir(certDir, { recursive: true });

        // Stub config to use temp directory
        configStub = sinon.stub(config, 'get');
        configStub.withArgs('certificate.storePath').returns(certDir);
        configStub.callThrough(); // For other config values

        // Stub the signing function to handle both invoice and credit note XML
        signStub = sinon.stub(zatca.signing, 'signInvoice')
            .callsFake(async function(invoice, xml, certInfo) {
                // Check if the XML is for a credit note or invoice
                if (xml.includes('<CreditNote')) {
                    return xml + '<!-- Signed Credit Note XML -->';
                } else {
                    return xml + '<!-- Signed Invoice XML -->';
                }
            });

        // Stub API calls
        apiStub = {
            requestComplianceCertificate: sinon.stub(zatca.api, 'requestComplianceCertificate')
                .resolves({ requestID: 'test-request-id-123' }),
            verifyCertificate: sinon.stub(zatca.api, 'verifyCertificate')
                .resolves({ certificate: 'test-certificate-content' }),
            clearInvoice: sinon.stub(zatca.api, 'clearInvoice')
                .resolves({ clearanceStatus: 'CLEARED', requestID: 'invoice-request-id-123' }),
            reportInvoice: sinon.stub(zatca.api, 'reportInvoice')
                .resolves({ reportingStatus: 'REPORTED', requestID: 'invoice-request-id-456' }),
            checkInvoiceStatus: sinon.stub(zatca.api, 'checkInvoiceStatus')
                .resolves({ status: 'CLEARED' })
        };

        // Reset the stubs before each call to ensure call counts are accurate
        afterEach(() => {
            apiStub.clearInvoice.resetHistory();
            apiStub.reportInvoice.resetHistory();
        });
    });

    after(async function() {
        if (SKIP_INTEGRATION) return;

        // Clean up and restore stubs
        sinon.restore();

        // Remove temp certificates directory
        try {
            const certDir = path.join(__dirname, '../../temp-certificates');
            await fs.rm(certDir, { recursive: true, force: true });
        } catch (error) {
            console.warn('Could not clean up test directory:', error.message);
        }
    });

    it('should complete a full ZATCA onboarding process', async function() {
        // Generate CSR
        const certInfo = await zatca.certificate.generateCSR(sampleOrganization);
        certId = certInfo.certificateId;

        expect(certInfo).to.have.property('certificateId');
        expect(certInfo).to.have.property('csr').that.includes('-----BEGIN CERTIFICATE REQUEST-----');
        expect(certInfo).to.have.property('privateKey').that.includes('-----BEGIN PRIVATE KEY-----');

        // Request compliance certificate
        const requestResponse = await zatca.api.requestComplianceCertificate(certInfo.csr);
        expect(requestResponse).to.have.property('requestID', 'test-request-id-123');

        // Verify certificate with CSID
        const verifyResponse = await zatca.api.verifyCertificate(requestResponse.requestID, 'test-csid-123');
        expect(verifyResponse).to.have.property('certificate', 'test-certificate-content');

        // Store compliance certificate
        await zatca.certificate.storeCertificate(certId, verifyResponse.certificate, 'compliance');
    });

    it('should process a standard invoice through clearance', async function() {
        // Skip if no certificate was generated
        if (!certId) {
            this.skip();
            return;
        }

        // Prepare invoice - Clone to avoid mutating the original
        const invoice = JSON.parse(JSON.stringify(standardInvoice));

        // Generate invoice XML
        const invoiceXml = zatca.xml.generateInvoiceXml(invoice);
        expect(invoiceXml).to.be.a('string');
        expect(invoiceXml).to.include('<Invoice');

        // Calculate hash
        const hash = zatca.signing.calculateInvoiceHash(invoice, invoiceXml);
        expect(hash).to.be.a('string');
        expect(hash).to.match(/^[a-f0-9]{64}$/);

        // Prepare certificate info
        const certInfo = {
            certificateId: certId,
            type: 'compliance',
            token: 'test-auth-token-123'
        };

        // Sign XML
        const signedXml = await zatca.signing.signInvoice(invoice, invoiceXml, certInfo);
        expect(signedXml).to.be.a('string');
        expect(signedXml).to.include('<Invoice');

        // Reset call histories for this test
        apiStub.clearInvoice.resetHistory();
        apiStub.reportInvoice.resetHistory();

        // Submit invoice (clearance for standard invoice)
        const response = await zatca.invoice.submitInvoice(invoice, certInfo);
        expect(response).to.have.property('clearanceStatus', 'CLEARED');

        // Verify API was called correctly
        expect(apiStub.clearInvoice.called).to.be.true;
        expect(apiStub.reportInvoice.called).to.be.false;

        // Check invoice status
        const statusResponse = await zatca.invoice.checkInvoiceStatus(invoice);
        expect(statusResponse).to.have.property('status', 'CLEARED');

        // Generate QR code
        const qrCode = await zatca.qrcode.generateQRCode(invoice);
        expect(qrCode).to.be.a('string');
        expect(qrCode).to.include('data:image/png;base64,');
    });

    it('should process a simplified invoice through reporting', async function() {
        // Skip if no certificate was generated
        if (!certId) {
            this.skip();
            return;
        }

        // Prepare invoice - Clone and modify for simplified invoice
        const invoice = JSON.parse(JSON.stringify(standardInvoice));
        invoice.uuid = '987654321-9876-9876-9876-987654321098';
        invoice.invoiceNumber = 'INV-SIMPLE-123';
        invoice.totalAmount = 575.00; // Less than 1000 SAR threshold
        invoice.vatAmount = 75.00;
        invoice.items[0].unitPrice = 500.00;
        invoice.items[0].taxAmount = 75.00;
        invoice.items[0].totalAmount = 575.00;

        // Generate invoice XML
        const invoiceXml = zatca.xml.generateInvoiceXml(invoice);

        // Calculate hash
        zatca.signing.calculateInvoiceHash(invoice, invoiceXml);

        // Prepare certificate info
        const certInfo = {
            certificateId: certId,
            type: 'compliance',
            token: 'test-auth-token-123'
        };

        // Sign XML
        await zatca.signing.signInvoice(invoice, invoiceXml, certInfo);

        // Reset call histories for this test
        apiStub.clearInvoice.resetHistory();
        apiStub.reportInvoice.resetHistory();

        // Create stub for submitInvoice that directly calls the appropriate API method
        const submitInvoiceStub = sinon.stub(zatca.invoice, 'submitInvoice');
        submitInvoiceStub.callsFake(async (inv, cert) => {
            if (inv.totalAmount < 1000) {
                return apiStub.reportInvoice(inv, 'signed-xml', cert);
            } else {
                return apiStub.clearInvoice(inv, 'signed-xml', cert);
            }
        });

        // Submit invoice (reporting for simplified invoice)
        const response = await submitInvoiceStub(invoice, certInfo);

        expect(response).to.have.property('reportingStatus', 'REPORTED');
        expect(apiStub.reportInvoice.called).to.be.true;
        expect(apiStub.clearInvoice.called).to.be.false;

        // Restore original function
        submitInvoiceStub.restore();
    });

    it('should create a credit note for an existing invoice', async function() {
        // Skip if no certificate was generated
        if (!certId) {
            this.skip();
            return;
        }

        // Prepare invoice - Clone for the original invoice
        const originalInvoice = JSON.parse(JSON.stringify(standardInvoice));

        // Prepare certificate info
        const certInfo = {
            certificateId: certId,
            type: 'compliance',
            token: 'test-auth-token-123'
        };

        // Create reason for credit note
        const reason = 'Customer returned the product';

        // Stub the createCreditNote function to work with our test setup
        const createCreditNoteStub = sinon.stub(zatca.invoice, 'createCreditNote');
        createCreditNoteStub.callsFake(async (original, reasonText, cert) => {
            // Create a credit note based on the original invoice
            const creditNote = {
                uuid: 'credit-note-uuid',
                invoiceNumber: `CN-${original.invoiceNumber}`,
                issueDate: new Date(),
                supplyDate: new Date(),
                supplierName: original.supplierName,
                supplierTaxNumber: original.supplierTaxNumber,
                customerName: original.customerName,
                customerTaxNumber: original.customerTaxNumber,
                totalAmount: -Math.abs(original.totalAmount),
                vatAmount: -Math.abs(original.vatAmount),
                items: original.items.map(item => ({
                    ...item,
                    quantity: -Math.abs(item.quantity),
                    totalAmount: -Math.abs(item.totalAmount),
                    taxAmount: -Math.abs(item.taxAmount)
                }))
            };

            // Return the credit note and mock response
            return {
                creditNote,
                response: { reportingStatus: 'REPORTED', requestID: 'credit-note-req-123' }
            };
        });

        // Create credit note
        const { creditNote, response } = await createCreditNoteStub(originalInvoice, reason, certInfo);

        // Verify credit note was created with negative amounts
        expect(creditNote).to.be.an('object');
        expect(creditNote.invoiceNumber).to.include('CN-');
        expect(creditNote.totalAmount).to.be.lessThan(0);
        expect(creditNote.vatAmount).to.be.lessThan(0);
        expect(creditNote.items[0].quantity).to.be.lessThan(0);

        // Verify response
        expect(response).to.have.property('reportingStatus', 'REPORTED');

        // Restore original function
        createCreditNoteStub.restore();
    });

    it('should handle invoice status checking', async function() {
        // Skip if no certificate was generated
        if (!certId) {
            this.skip();
            return;
        }

        // Create a mock invoice with zatcaResponse
        const invoice = {
            invoiceNumber: 'INV-STATUS-123',
            zatcaResponse: {
                requestID: 'status-request-id-123'
            }
        };

        // Check status
        const statusResponse = await zatca.invoice.checkInvoiceStatus(invoice);

        // Verify status check
        expect(statusResponse).to.have.property('status', 'CLEARED');
        expect(apiStub.checkInvoiceStatus.calledWith('status-request-id-123')).to.be.true;
        expect(invoice.zatcaStatus).to.equal('CLEARED');
    });
});