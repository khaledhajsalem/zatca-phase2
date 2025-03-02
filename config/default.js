/**
 * Default configuration for ZATCA Phase 2 Integration
 */
module.exports = {
    api: {
        baseUrl: 'https://gw-apic-gov.gazt.gov.sa/e-invoicing/developer-portal',
        complianceUrl: '/compliance',
        reportingUrl: '/invoices/reporting/single',
        clearanceUrl: '/invoices/clearance/single',
        statusUrl: '/invoices/status',
        timeout: 30000
    },
    certificate: {
        storePath: './certificates'
    },
    organization: {
        name: process.env.ZATCA_ORG_NAME || '',
        taxNumber: process.env.ZATCA_TAX_NUMBER || ''
    },
    pih: process.env.ZATCA_PIH || '',
    production: process.env.ZATCA_PRODUCTION === 'true',
    clearanceThreshold: 1000,
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: './logs/zatca.log'
    }
};