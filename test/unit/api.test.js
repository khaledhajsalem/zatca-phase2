/**
 * Unit tests for API module
 */
const { expect } = require('chai');
const sinon = require('sinon');
const api = require('../../lib/api');
const apiClient = require('../../lib/api/client');
const { ZatcaError } = require('../../lib/errors');

describe('API Module', () => {
  let axiosStub;

  beforeEach(() => {
    // Stub the post and get methods directly on the apiClient
    axiosStub = {
      post: sinon.stub(apiClient, 'post').resolves({
        data: { success: true, requestID: '123456' }
      }),
      get: sinon.stub(apiClient, 'get').resolves({
        data: { status: 'PROCESSED' }
      })
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('requestComplianceCertificate', () => {
    it('should make a POST request with the CSR', async () => {
      const result = await api.requestComplianceCertificate('-----BEGIN CERTIFICATE REQUEST-----\nMIIB...');

      expect(axiosStub.post.calledOnce).to.be.true;

      // Verify first argument (URL)
      const call = axiosStub.post.getCall(0);
      expect(call.args[0]).to.include('compliance');

      // Verify second argument (data)
      expect(call.args[1]).to.have.property('csr');

      // Verify response
      expect(result).to.deep.equal({ success: true, requestID: '123456' });
    });

    it('should handle API errors', async () => {
      // Create a ZatcaError to be thrown
      const zatcaError = new ZatcaError('API error', 'API_ERR');
      axiosStub.post.rejects(zatcaError);

      try {
        await api.requestComplianceCertificate('CSR-CONTENT');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.name).to.equal('ZatcaError');
      }
    });
  });

  describe('verifyCertificate', () => {
    it('should make a POST request with requestID and CSID', async () => {
      const result = await api.verifyCertificate('123456', 'CSID123');

      expect(axiosStub.post.calledOnce).to.be.true;

      // Verify arguments
      const call = axiosStub.post.getCall(0);
      expect(call.args[0]).to.include('compliance');
      expect(call.args[0]).to.include('verify');
      expect(call.args[1]).to.have.property('requestID', '123456');
      expect(call.args[1]).to.have.property('csid', 'CSID123');

      // Verify response
      expect(result).to.deep.equal({ success: true, requestID: '123456' });
    });
  });

  describe('clearInvoice', () => {
    it('should make a POST request with invoice data', async () => {
      const invoice = {
        hash: 'hash123',
        uuid: 'uuid123'
      };

      const signedXml = '<Invoice>Signed XML</Invoice>';

      const certificate = {
        token: 'auth-token-123'
      };

      const result = await api.clearInvoice(invoice, signedXml, certificate);

      expect(axiosStub.post.calledOnce).to.be.true;

      // Verify URL
      const call = axiosStub.post.getCall(0);
      expect(call.args[0]).to.include('clearance');

      // Verify data
      expect(call.args[1]).to.have.property('invoiceHash', 'hash123');
      expect(call.args[1]).to.have.property('uuid', 'uuid123');
      expect(call.args[1]).to.have.property('invoice').that.is.a('string');

      // Verify headers
      expect(call.args[2].headers).to.have.property('Authorization', 'Bearer auth-token-123');

      // Verify response
      expect(result).to.deep.equal({ success: true, requestID: '123456' });
    });
  });

  describe('reportInvoice', () => {
    it('should make a POST request with invoice data', async () => {
      const invoice = {
        hash: 'hash123',
        uuid: 'uuid123'
      };

      const signedXml = '<Invoice>Signed XML</Invoice>';

      const certificate = {
        token: 'auth-token-123'
      };

      const result = await api.reportInvoice(invoice, signedXml, certificate);

      expect(axiosStub.post.calledOnce).to.be.true;

      // Verify URL
      const call = axiosStub.post.getCall(0);
      expect(call.args[0]).to.include('reporting');

      // Verify data
      expect(call.args[1]).to.have.property('invoiceHash', 'hash123');
      expect(call.args[1]).to.have.property('uuid', 'uuid123');
      expect(call.args[1]).to.have.property('invoice').that.is.a('string');

      // Verify headers
      expect(call.args[2].headers).to.have.property('Authorization', 'Bearer auth-token-123');

      // Verify response
      expect(result).to.deep.equal({ success: true, requestID: '123456' });
    });
  });

  describe('checkInvoiceStatus', () => {
    it('should make a GET request with request ID', async () => {
      const result = await api.checkInvoiceStatus('123456');

      expect(axiosStub.get.calledOnce).to.be.true;

      // Verify URL
      const call = axiosStub.get.getCall(0);
      expect(call.args[0]).to.include('status');
      expect(call.args[0]).to.include('123456');

      // Verify response
      expect(result).to.deep.equal({ status: 'PROCESSED' });
    });
  });
});