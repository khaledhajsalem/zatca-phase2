/**
 * Invoice XML Generation Module
 * @module zatca-phase2/xml/invoice
 * @private
 */

const js2xmlparser = require('js2xmlparser');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { ZatcaError, ErrorCodes } = require('../errors');
const logger = require('../utils/logger');
const { formatDate, formatTime } = require('../utils/date');
const { validateInvoice } = require('../utils/validation');

/**
 * Generate XML for an invoice
 * @function
 * @param {Object} invoice - Invoice object
 * @returns {string} XML string
 */
exports.generateInvoiceXml = function(invoice) {
  try {
    logger.debug('Generating invoice XML', { invoiceNumber: invoice.invoiceNumber });

    // Validate invoice
    validateInvoice(invoice);

    const now = new Date();
    const uuid = invoice.uuid || uuidv4();

    // Ensure dates are proper Date objects
    const issueDate = invoice.issueDate instanceof Date ? invoice.issueDate : new Date(invoice.issueDate || now);
    const supplyDate = invoice.supplyDate instanceof Date ? invoice.supplyDate : new Date(invoice.supplyDate || now);

    // Format dates
    const issueDateFormatted = formatDate(issueDate);
    const issueTimeFormatted = formatTime(issueDate);

    // Create invoice XML structure
    const invoiceObject = {
      '@': {
        'xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
        'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
        'xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2'
      },
      'cbc:UBLVersionID': '2.1',
      'cbc:ProfileID': invoice.totalAmount >= 1000 ? 'reporting:1.0' : 'standard:reporting:1.0',
      'cbc:ID': invoice.invoiceNumber,
      'cbc:UUID': uuid,
      'cbc:IssueDate': issueDateFormatted,
      'cbc:IssueTime': issueTimeFormatted,
      'cbc:InvoiceTypeCode': '388',
      'cbc:DocumentCurrencyCode': 'SAR',
      'cbc:TaxCurrencyCode': 'SAR',
      'cac:AdditionalDocumentReference': {
        'cbc:ID': 'ICV',
        'cbc:UUID': generateICV()
      },
      'cac:AccountingSupplierParty': {
        'cac:Party': {
          'cac:PartyIdentification': {
            'cbc:ID': invoice.supplierTaxNumber
          },
          'cac:PartyName': {
            'cbc:Name': invoice.supplierName
          },
          'cac:PostalAddress': {
            'cbc:StreetName': invoice.supplierStreet || 'Street',
            'cbc:BuildingNumber': invoice.supplierBuilding || '1234',
            'cbc:CityName': invoice.supplierCity || 'City',
            'cbc:PostalZone': invoice.supplierPostalCode || '12345',
            'cbc:CountrySubentity': invoice.supplierRegion || 'Region',
            'cac:Country': {
              'cbc:IdentificationCode': 'SA'
            }
          },
          'cac:PartyTaxScheme': {
            'cbc:CompanyID': invoice.supplierTaxNumber,
            'cac:TaxScheme': {
              'cbc:ID': 'VAT'
            }
          }
        }
      },
      'cac:AccountingCustomerParty': {
        'cac:Party': {
          'cac:PartyIdentification': {
            'cbc:ID': invoice.customerTaxNumber || 'NA'
          },
          'cac:PartyName': {
            'cbc:Name': invoice.customerName
          },
          'cac:PostalAddress': {
            'cbc:StreetName': invoice.customerStreet || 'Street',
            'cbc:BuildingNumber': invoice.customerBuilding || '1234',
            'cbc:CityName': invoice.customerCity || 'City',
            'cbc:PostalZone': invoice.customerPostalCode || '12345',
            'cbc:CountrySubentity': invoice.customerRegion || 'Region',
            'cac:Country': {
              'cbc:IdentificationCode': 'SA'
            }
          },
          'cac:PartyTaxScheme': {
            'cbc:CompanyID': invoice.customerTaxNumber || 'NA',
            'cac:TaxScheme': {
              'cbc:ID': 'VAT'
            }
          }
        }
      },
      'cac:TaxTotal': {
        'cbc:TaxAmount': {
          '@': { 'currencyID': 'SAR' },
          '#': invoice.vatAmount.toFixed(2)
        },
        'cac:TaxSubtotal': {
          'cbc:TaxableAmount': {
            '@': { 'currencyID': 'SAR' },
            '#': (invoice.totalAmount - invoice.vatAmount).toFixed(2)
          },
          'cbc:TaxAmount': {
            '@': { 'currencyID': 'SAR' },
            '#': invoice.vatAmount.toFixed(2)
          },
          'cac:TaxCategory': {
            'cbc:ID': 'S',
            'cbc:Percent': '15.00',
            'cac:TaxScheme': {
              'cbc:ID': 'VAT'
            }
          }
        }
      },
      'cac:LegalMonetaryTotal': {
        'cbc:LineExtensionAmount': {
          '@': { 'currencyID': 'SAR' },
          '#': (invoice.totalAmount - invoice.vatAmount).toFixed(2)
        },
        'cbc:TaxExclusiveAmount': {
          '@': { 'currencyID': 'SAR' },
          '#': (invoice.totalAmount - invoice.vatAmount).toFixed(2)
        },
        'cbc:TaxInclusiveAmount': {
          '@': { 'currencyID': 'SAR' },
          '#': invoice.totalAmount.toFixed(2)
        },
        'cbc:PayableAmount': {
          '@': { 'currencyID': 'SAR' },
          '#': invoice.totalAmount.toFixed(2)
        }
      },
      'cac:InvoiceLine': invoice.items.map((item, index) => ({
        'cbc:ID': (index + 1).toString(),
        'cbc:InvoicedQuantity': {
          '@': { 'unitCode': item.unitCode || 'EA' },
          '#': item.quantity.toString()
        },
        'cbc:LineExtensionAmount': {
          '@': { 'currencyID': 'SAR' },
          '#': (item.quantity * item.unitPrice).toFixed(2)
        },
        'cac:TaxTotal': {
          'cbc:TaxAmount': {
            '@': { 'currencyID': 'SAR' },
            '#': item.taxAmount.toFixed(2)
          },
          'cbc:RoundingAmount': {
            '@': { 'currencyID': 'SAR' },
            '#': (item.quantity * item.unitPrice + item.taxAmount).toFixed(2)
          }
        },
        'cac:Item': {
          'cbc:Name': item.name,
          'cac:ClassifiedTaxCategory': {
            'cbc:ID': 'S',
            'cbc:Percent': item.taxRate.toFixed(2),
            'cac:TaxScheme': {
              'cbc:ID': 'VAT'
            }
          }
        },
        'cac:Price': {
          'cbc:PriceAmount': {
            '@': { 'currencyID': 'SAR' },
            '#': item.unitPrice.toFixed(2)
          }
        }
      }))
    };

    // Generate XML
    const xml = js2xmlparser.parse('Invoice', invoiceObject, {
      declaration: {
        include: true,
        encoding: 'UTF-8'
      },
      format: {
        doubleQuotes: true
      }
    });

    logger.debug('Invoice XML generated successfully');

    return xml;
  } catch (error) {
    logger.error('Failed to generate invoice XML', { error: error.message });

    if (error.name === 'ZatcaError') {
      throw error;
    }

    throw new ZatcaError(
        `Failed to generate invoice XML: ${error.message}`,
        ErrorCodes.XML_GENERATION_ERROR
    );
  }
};

/**
 * Calculate hash for an invoice XML
 * @function
 * @param {string} xml - XML string
 * @returns {string} SHA-256 hash
 */
exports.calculateInvoiceHash = function(xml) {
  return crypto.createHash('sha256').update(xml).digest('hex');
};

/**
 * Generate Invoice Counter Value (ICV)
 * @function
 * @returns {string} Random ICV
 * @private
 */
function generateICV() {
  return crypto.randomBytes(4).toString('hex');
}