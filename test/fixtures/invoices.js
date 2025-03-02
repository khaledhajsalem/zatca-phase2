/**
 * Invoice fixtures for tests
 * @module test/fixtures/invoices
 */

/**
 * Sample standard invoice
 */
exports.standardInvoice = {
  uuid: '123e4567-e89b-12d3-a456-426614174000',
  invoiceNumber: 'INV-12345',
  issueDate: new Date('2023-04-15T12:00:00Z'),
  supplyDate: new Date('2023-04-15T12:00:00Z'),
  supplierName: 'Test Supplier Company',
  supplierTaxNumber: '123456789012345',
  supplierStreet: 'Supplier Street',
  supplierBuilding: '123',
  supplierCity: 'Riyadh',
  supplierPostalCode: '12345',
  supplierRegion: 'Riyadh Region',
  customerName: 'Test Customer Company',
  customerTaxNumber: '987654321098765',
  customerStreet: 'Customer Street',
  customerBuilding: '456',
  customerCity: 'Jeddah',
  customerPostalCode: '54321',
  customerRegion: 'Makkah Region',
  totalAmount: 1150.00,
  vatAmount: 150.00,
  items: [
    {
      name: 'Product A',
      quantity: 1,
      unitCode: 'EA',
      unitPrice: 1000.00,
      taxRate: 15,
      taxAmount: 150.00,
      totalAmount: 1150.00
    }
  ]
};

/**
 * Sample simplified invoice (less than 1000 SAR)
 */
exports.simplifiedInvoice = {
  uuid: '223e4567-e89b-12d3-a456-426614174001',
  invoiceNumber: 'INV-12346',
  issueDate: new Date('2023-04-16T12:00:00Z'),
  supplyDate: new Date('2023-04-16T12:00:00Z'),
  supplierName: 'Test Supplier Company',
  supplierTaxNumber: '123456789012345',
  supplierStreet: 'Supplier Street',
  supplierBuilding: '123',
  supplierCity: 'Riyadh',
  supplierPostalCode: '12345',
  supplierRegion: 'Riyadh Region',
  customerName: 'Test Customer (B2C)',
  totalAmount: 115.00,
  vatAmount: 15.00,
  items: [
    {
      name: 'Product B',
      quantity: 1,
      unitCode: 'EA',
      unitPrice: 100.00,
      taxRate: 15,
      taxAmount: 15.00,
      totalAmount: 115.00
    }
  ]
};

/**
 * Sample credit note
 */
exports.creditNote = {
  uuid: '323e4567-e89b-12d3-a456-426614174002',
  invoiceNumber: 'CN-12345',
  issueDate: new Date('2023-04-17T12:00:00Z'),
  supplyDate: new Date('2023-04-17T12:00:00Z'),
  supplierName: 'Test Supplier Company',
  supplierTaxNumber: '123456789012345',
  supplierStreet: 'Supplier Street',
  supplierBuilding: '123',
  supplierCity: 'Riyadh',
  supplierPostalCode: '12345',
  supplierRegion: 'Riyadh Region',
  customerName: 'Test Customer Company',
  customerTaxNumber: '987654321098765',
  customerStreet: 'Customer Street',
  customerBuilding: '456',
  customerCity: 'Jeddah',
  customerPostalCode: '54321',
  customerRegion: 'Makkah Region',
  totalAmount: -1150.00,
  vatAmount: -150.00,
  items: [
    {
      name: 'Product A',
      quantity: -1,
      unitCode: 'EA',
      unitPrice: 1000.00,
      taxRate: 15,
      taxAmount: -150.00,
      totalAmount: -1150.00
    }
  ]
};

/**
 * Sample invoice with multiple items
 */
exports.multiItemInvoice = {
  uuid: '423e4567-e89b-12d3-a456-426614174003',
  invoiceNumber: 'INV-12347',
  issueDate: new Date('2023-04-18T12:00:00Z'),
  supplyDate: new Date('2023-04-18T12:00:00Z'),
  supplierName: 'Test Supplier Company',
  supplierTaxNumber: '123456789012345',
  supplierStreet: 'Supplier Street',
  supplierBuilding: '123',
  supplierCity: 'Riyadh',
  supplierPostalCode: '12345',
  supplierRegion: 'Riyadh Region',
  customerName: 'Test Customer Company',
  customerTaxNumber: '987654321098765',
  customerStreet: 'Customer Street',
  customerBuilding: '456',
  customerCity: 'Jeddah',
  customerPostalCode: '54321',
  customerRegion: 'Makkah Region',
  totalAmount: 2300.00,
  vatAmount: 300.00,
  items: [
    {
      name: 'Product A',
      quantity: 1,
      unitCode: 'EA',
      unitPrice: 1000.00,
      taxRate: 15,
      taxAmount: 150.00,
      totalAmount: 1150.00
    },
    {
      name: 'Product B',
      quantity: 2,
      unitCode: 'EA',
      unitPrice: 500.00,
      taxRate: 15,
      taxAmount: 150.00,
      totalAmount: 1150.00
    }
  ]
};

/**
 * Invoice with ZATCA response (for status checking)
 */
exports.submittedInvoice = {
  uuid: '523e4567-e89b-12d3-a456-426614174004',
  invoiceNumber: 'INV-12348',
  issueDate: new Date('2023-04-19T12:00:00Z'),
  supplyDate: new Date('2023-04-19T12:00:00Z'),
  supplierName: 'Test Supplier Company',
  supplierTaxNumber: '123456789012345',
  customerName: 'Test Customer Company',
  customerTaxNumber: '987654321098765',
  totalAmount: 1150.00,
  vatAmount: 150.00,
  zatcaStatus: 'submitted',
  zatcaResponse: {
    requestID: '12345678-1234-1234-1234-123456789012',
    validationResults: true,
    clearanceStatus: 'CLEARED'
  }
};