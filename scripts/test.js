/**
 * Test setup file for zatca-phase2 library
 *
 * This file is loaded before running tests
 */
const chai = require('chai');
const sinon = require('sinon');

// Add chai plugins if needed
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);

// Set test environment
process.env.NODE_ENV = 'test';

// Suppress logs during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

if (process.env.VERBOSE_TESTS !== 'true') {
    console.log = () => {};
    console.error = () => {};
    console.warn = () => {};
}

// Add global test helpers
global.expect = chai.expect;
global.sinon = sinon;

// Create sample test data that can be used across tests
global.testData = {
    sampleInvoice: {
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
    },

    sampleCertificateInfo: {
        certificateId: 'test-cert-123',
        type: 'compliance',
        token: 'test-token-123'
    }
};

// Cleanup after tests
after(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
});