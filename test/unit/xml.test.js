/**
 * Unit tests for XML module
 */
const { expect } = require('chai');
const xml = require('../../lib/xml');

describe('XML Module', () => {
  describe('generateInvoiceXml', () => {
    it('should generate valid XML for an invoice', () => {
      const invoice = {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        invoiceNumber: 'INV-123',
        issueDate: new Date('2023-04-15T12:00:00Z'),
        supplyDate: new Date('2023-04-15T12:00:00Z'),
        supplierName: 'Test Supplier',
        supplierTaxNumber: '123456789012345',
        customerName: 'Test Customer',
        customerTaxNumber: '987654321098765',
        totalAmount: 115.00,
        vatAmount: 15.00,
        items: [
          {
            name: 'Test Product',
            quantity: 1,
            unitPrice: 100.00,
            taxRate: 15,
            taxAmount: 15.00,
            totalAmount: 115.00
          }
        ]
      };

      const result = xml.generateInvoiceXml(invoice);

      // Basic validations
      expect(result).to.be.a('string');
      expect(result).to.include('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).to.include('<Invoice');
      expect(result).to.include('<cbc:ID>INV-123</cbc:ID>');
      expect(result).to.include('<cbc:UUID>123e4567-e89b-12d3-a456-426614174000</cbc:UUID>');
      expect(result).to.include('Test Supplier');
      expect(result).to.include('Test Customer');
      expect(result).to.include('123456789012345'); // supplier tax number
      expect(result).to.include('987654321098765'); // customer tax number
      expect(result).to.include('Test Product');

      // XML structure validation
      expect(result).to.include('<cbc:TaxAmount currencyID="SAR">15.00</cbc:TaxAmount>');
      expect(result).to.include('<cbc:PayableAmount currencyID="SAR">115.00</cbc:PayableAmount>');
    });

    it('should throw error for invalid invoice data', () => {
      const invalidInvoice = {
        // Missing required fields
        invoiceNumber: 'INV-123'
      };

      expect(() => xml.generateInvoiceXml(invalidInvoice)).to.throw();
    });
  });

  describe('generateCreditNoteXml', () => {
    it('should generate valid XML for a credit note', () => {
      const creditNote = {
        uuid: '223e4567-e89b-12d3-a456-426614174000',
        invoiceNumber: 'CN-123',
        issueDate: new Date('2023-04-16T12:00:00Z'),
        supplyDate: new Date('2023-04-16T12:00:00Z'),
        supplierName: 'Test Supplier',
        supplierTaxNumber: '123456789012345',
        customerName: 'Test Customer',
        customerTaxNumber: '987654321098765',
        totalAmount: -115.00,
        vatAmount: -15.00,
        items: [
          {
            name: 'Test Product',
            quantity: -1,
            unitPrice: 100.00,
            taxRate: 15,
            taxAmount: -15.00,
            totalAmount: -115.00
          }
        ]
      };

      const originalInvoice = {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        invoiceNumber: 'INV-123',
        issueDate: new Date('2023-04-15T12:00:00Z')
      };

      const reason = 'Customer returned the product';

      const result = xml.generateCreditNoteXml(creditNote, originalInvoice, reason);

      // Basic validations
      expect(result).to.be.a('string');
      expect(result).to.include('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).to.include('<CreditNote');
      expect(result).to.include('<cbc:ID>CN-123</cbc:ID>');
      expect(result).to.include('<cbc:UUID>223e4567-e89b-12d3-a456-426614174000</cbc:UUID>');
      expect(result).to.include('Test Supplier');
      expect(result).to.include('Test Customer');
      expect(result).to.include(reason);
      expect(result).to.include('INV-123'); // reference to original invoice

      // Specific credit note validations
      expect(result).to.include('<cbc:CreditNoteTypeCode>381</cbc:CreditNoteTypeCode>');
      expect(result).to.include('<cac:BillingReference>');
    });

    it('should throw error for invalid credit note data', () => {
      const invalidCreditNote = {
        // Missing required fields
        invoiceNumber: 'CN-123'
      };

      const originalInvoice = {
        invoiceNumber: 'INV-123',
        issueDate: new Date()
      };

      expect(() => xml.generateCreditNoteXml(invalidCreditNote, originalInvoice, 'reason')).to.throw();
    });
  });

  describe('calculateInvoiceHash', () => {
    it('should generate a valid SHA-256 hash', () => {
      const sampleXml = '<Invoice>Test content</Invoice>';
      const hash = xml.calculateInvoiceHash(sampleXml);

      expect(hash).to.be.a('string');
      expect(hash).to.match(/^[a-f0-9]{64}$/); // SHA-256 hash format (64 hex chars)

      // Verify hash is deterministic
      const hash2 = xml.calculateInvoiceHash(sampleXml);
      expect(hash).to.equal(hash2);

      // Verify hash changes with content
      const hash3 = xml.calculateInvoiceHash('<Invoice>Different content</Invoice>');
      expect(hash).to.not.equal(hash3);
    });
  });
});