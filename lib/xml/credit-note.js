/**
 * Credit Note XML Generation Module
 * @module zatca-phase2/xml/credit-note
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
 * Generate XML for a credit note
 * @function
 * @param {Object} creditNote - Credit note object
 * @param {Object} originalInvoice - Original invoice object
 * @param {string} reason - Reason for credit note
 * @returns {string} XML string
 */
exports.generateCreditNoteXml = function(creditNote, originalInvoice, reason) {
  try {
    logger.debug('Generating credit note XML', {
      creditNoteNumber: creditNote.invoiceNumber,
      originalInvoiceNumber: originalInvoice.invoiceNumber
    });

    // Validate credit note
    validateInvoice(creditNote);

    const now = new Date();
    const uuid = creditNote.uuid || uuidv4();

    // Ensure dates are proper Date objects
    const issueDate = creditNote.issueDate instanceof Date ? creditNote.issueDate : new Date(creditNote.issueDate || now);

    // Ensure original invoice date is a proper Date object
    const originalIssueDate = originalInvoice.issueDate instanceof Date
      ? originalInvoice.issueDate
      : new Date(originalInvoice.issueDate || now);

    // Format dates
    const issueDateFormatted = formatDate(issueDate);
    const issueTimeFormatted = formatTime(issueDate);
    const originalIssueDateFormatted = formatDate(originalIssueDate);

    // Create credit note XML structure (similar to invoice but with specific credit note elements)
    const creditNoteObject = {
      '@': {
        'xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
        'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
        'xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2'
      },
      'cbc:UBLVersionID': '2.1',
      'cbc:ProfileID': 'reporting:1.0',
      'cbc:ID': creditNote.invoiceNumber,
      'cbc:UUID': uuid,
      'cbc:IssueDate': issueDateFormatted,
      'cbc:IssueTime': issueTimeFormatted,
      'cbc:CreditNoteTypeCode': '381',
      'cbc:DocumentCurrencyCode': 'SAR',
      'cbc:TaxCurrencyCode': 'SAR',
      'cbc:Note': reason || 'Credit note for invoice ' + originalInvoice.invoiceNumber,
      'cac:AdditionalDocumentReference': [
        {
          'cbc:ID': 'ICV',
          'cbc:UUID': generateICV()
        },
        {
          'cbc:ID': 'PIH',
          'cbc:DocumentDescription': 'Credit note for invoice ' + originalInvoice.invoiceNumber
        }
      ],
      'cac:BillingReference': {
        'cac:InvoiceDocumentReference': {
          'cbc:ID': originalInvoice.invoiceNumber,
          'cbc:UUID': originalInvoice.uuid,
          'cbc:IssueDate': originalIssueDateFormatted
        }
      },
      'cac:AccountingSupplierParty': {
        'cac:Party': {
          'cac:PartyIdentification': {
            'cbc:ID': creditNote.supplierTaxNumber
          },
          'cac:PartyName': {
            'cbc:Name': creditNote.supplierName
          },
          'cac:PostalAddress': {
            'cbc:StreetName': creditNote.supplierStreet || 'Street',
            'cbc:BuildingNumber': creditNote.supplierBuilding || '1234',
            'cbc:CityName': creditNote.supplierCity || 'City',
            'cbc:PostalZone': creditNote.supplierPostalCode || '12345',
            'cbc:CountrySubentity': creditNote.supplierRegion || 'Region',
            'cac:Country': {
              'cbc:IdentificationCode': 'SA'
            }
          },
          'cac:PartyTaxScheme': {
            'cbc:CompanyID': creditNote.supplierTaxNumber,
            'cac:TaxScheme': {
              'cbc:ID': 'VAT'
            }
          }
        }
      },
      'cac:AccountingCustomerParty': {
        'cac:Party': {
          'cac:PartyIdentification': {
            'cbc:ID': creditNote.customerTaxNumber || 'NA'
          },
          'cac:PartyName': {
            'cbc:Name': creditNote.customerName
          },
          'cac:PostalAddress': {
            'cbc:StreetName': creditNote.customerStreet || 'Street',
            'cbc:BuildingNumber': creditNote.customerBuilding || '1234',
            'cbc:CityName': creditNote.customerCity || 'City',
            'cbc:PostalZone': creditNote.customerPostalCode || '12345',
            'cbc:CountrySubentity': creditNote.customerRegion || 'Region',
            'cac:Country': {
              'cbc:IdentificationCode': 'SA'
            }
          },
          'cac:PartyTaxScheme': {
            'cbc:CompanyID': creditNote.customerTaxNumber || 'NA',
            'cac:TaxScheme': {
              'cbc:ID': 'VAT'
            }
          }
        }
      },
      'cac:TaxTotal': {
        'cbc:TaxAmount': {
          '@': { 'currencyID': 'SAR' },
          '#': Math.abs(creditNote.vatAmount).toFixed(2)
        },
        'cac:TaxSubtotal': {
          'cbc:TaxableAmount': {
            '@': { 'currencyID': 'SAR' },
            '#': Math.abs(creditNote.totalAmount - creditNote.vatAmount).toFixed(2)
          },
          'cbc:TaxAmount': {
            '@': { 'currencyID': 'SAR' },
            '#': Math.abs(creditNote.vatAmount).toFixed(2)
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
          '#': Math.abs(creditNote.totalAmount - creditNote.vatAmount).toFixed(2)
        },
        'cbc:TaxExclusiveAmount': {
          '@': { 'currencyID': 'SAR' },
          '#': Math.abs(creditNote.totalAmount - creditNote.vatAmount).toFixed(2)
        },
        'cbc:TaxInclusiveAmount': {
          '@': { 'currencyID': 'SAR' },
          '#': Math.abs(creditNote.totalAmount).toFixed(2)
        },
        'cbc:PayableAmount': {
          '@': { 'currencyID': 'SAR' },
          '#': Math.abs(creditNote.totalAmount).toFixed(2)
        }
      },
      'cac:CreditNoteLine': creditNote.items.map((item, index) => ({
        'cbc:ID': (index + 1).toString(),
        'cbc:CreditedQuantity': {
          '@': { 'unitCode': item.unitCode || 'EA' },
          '#': Math.abs(item.quantity).toString()
        },
        'cbc:LineExtensionAmount': {
          '@': { 'currencyID': 'SAR' },
          '#': Math.abs(item.quantity * item.unitPrice).toFixed(2)
        },
        'cac:TaxTotal': {
          'cbc:TaxAmount': {
            '@': { 'currencyID': 'SAR' },
            '#': Math.abs(item.taxAmount).toFixed(2)
          },
          'cbc:RoundingAmount': {
            '@': { 'currencyID': 'SAR' },
            '#': Math.abs(item.quantity * item.unitPrice + item.taxAmount).toFixed(2)
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
    const xml = js2xmlparser.parse('CreditNote', creditNoteObject, {
      declaration: {
        include: true,
        encoding: 'UTF-8'
      },
      format: {
        doubleQuotes: true
      }
    });

    logger.debug('Credit note XML generated successfully');

    return xml;
  } catch (error) {
    logger.error('Failed to generate credit note XML', { error: error.message });

    if (error.name === 'ZatcaError') {
      throw error;
    }

    throw new ZatcaError(
      `Failed to generate credit note XML: ${error.message}`,
      ErrorCodes.XML_GENERATION_ERROR
    );
  }
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