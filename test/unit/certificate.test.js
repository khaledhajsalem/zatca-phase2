/**
 * Unit tests for certificate module
 */
const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs').promises;
const forge = require('node-forge');
const config = require('config');
const certificate = require('../../lib/certificate');
const store = require('../../lib/certificate/store');

describe('Certificate Module', () => {
  let fsStub;
  let storeCertificateStub;
  let configStub;

  beforeEach(() => {
    // Stub config
    configStub = sinon.stub(config, 'get');
    configStub.withArgs('certificate.storePath').returns('./test-certificates');

    // Stub fs.mkdir and fs.writeFile
    fsStub = {
      mkdir: sinon.stub(fs, 'mkdir').resolves(),
      writeFile: sinon.stub(fs, 'writeFile').resolves(),
      readFile: sinon.stub(fs, 'readFile').resolves('test-certificate-content')
    };

    // Directly stub the store.storeCertificate function
    storeCertificateStub = sinon.stub(store, 'storeCertificate').resolves();

    // Mock forge functions that are used
    sinon.stub(forge.pki.rsa, 'generateKeyPair').returns({
      privateKey: {
        sign: () => {}
      },
      publicKey: {}
    });

    sinon.stub(forge.pki, 'privateKeyToAsn1').returns({});
    sinon.stub(forge.pki, 'wrapRsaPrivateKey').returns({});
    sinon.stub(forge.pki, 'privateKeyInfoToPem').returns('-----BEGIN PRIVATE KEY-----\nMIITest\n-----END PRIVATE KEY-----');
    sinon.stub(forge.pki, 'publicKeyToPem').returns('-----BEGIN PUBLIC KEY-----\nMIITest\n-----END PUBLIC KEY-----');

    const csrMock = {
      subject: {
        addField: sinon.stub()
      },
      publicKey: null,
      sign: sinon.stub()
    };

    sinon.stub(forge.pki, 'createCertificationRequest').returns(csrMock);
    sinon.stub(forge.pki, 'certificationRequestToPem').returns('-----BEGIN CERTIFICATE REQUEST-----\nMIITest\n-----END CERTIFICATE REQUEST-----');
  });

  afterEach(() => {
    // Restore stubs
    sinon.restore();
  });

  describe('generateCSR', () => {
    it('should generate a valid CSR with organization details', async () => {
      const organization = {
        name: 'Test Company',
        city: 'Test City',
        region: 'Test Region',
        email: 'test@example.com'
      };

      const result = await certificate.generateCSR(organization);

      // Verify result structure
      expect(result).to.be.an('object');
      expect(result).to.have.property('certificateId').that.is.a('string');
      expect(result).to.have.property('csr').that.is.a('string');
      expect(result).to.have.property('privateKey').that.is.a('string');
      expect(result).to.have.property('publicKey').that.is.a('string');

      // Verify CSR format
      expect(result.csr).to.include('-----BEGIN CERTIFICATE REQUEST-----');
      expect(result.csr).to.include('-----END CERTIFICATE REQUEST-----');

      // Verify private key format
      expect(result.privateKey).to.include('-----BEGIN PRIVATE KEY-----');
      expect(result.privateKey).to.include('-----END PRIVATE KEY-----');

      // Verify store certificate calls (three calls for csr, private, and public)
      expect(storeCertificateStub.callCount).to.equal(3);
      expect(storeCertificateStub.getCall(0).args[2]).to.equal('csr');
      expect(storeCertificateStub.getCall(1).args[2]).to.equal('private');
      expect(storeCertificateStub.getCall(2).args[2]).to.equal('public');
    });

    it('should throw ZatcaError if generation fails', async () => {
      // Make the storeCertificate function fail
      storeCertificateStub.rejects(new Error('Write failed'));

      const organization = {
        name: 'Test Company',
        city: 'Test City',
        region: 'Test Region',
        email: 'test@example.com'
      };

      try {
        await certificate.generateCSR(organization);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.name).to.equal('ZatcaError');
        expect(error.code).to.equal('CERT_GEN_ERR');
      }
    });
  });

  describe('storeCertificate', () => {
    it('should store certificate to the filesystem', async () => {
      const certificateId = '123456789';
      const certificateContent = '-----BEGIN CERTIFICATE-----\nABCDEF\n-----END CERTIFICATE-----';
      const type = 'compliance';

      await certificate.storeCertificate(certificateId, certificateContent, type);

      expect(fsStub.mkdir.calledOnce).to.be.true;
      expect(fsStub.writeFile.calledOnce).to.be.true;

      // Verify correct path and content
      const writeFileCall = fsStub.writeFile.getCall(0);
      expect(writeFileCall.args[0]).to.include(`${type}_${certificateId}.pem`);
      expect(writeFileCall.args[1]).to.equal(certificateContent);
    });

    it('should throw ZatcaError if storage fails', async () => {
      fsStub.writeFile.rejects(new Error('Write failed'));

      try {
        await certificate.storeCertificate('123', 'content', 'compliance');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.name).to.equal('ZatcaError');
        expect(error.code).to.equal('CERT_STORAGE_ERROR');
      }
    });
  });

  describe('loadCertificate', () => {
    it('should load certificate from the filesystem', async () => {
      const certificateId = '123456789';
      const type = 'compliance';

      const result = await certificate.loadCertificate(certificateId, type);

      expect(fsStub.readFile.calledOnce).to.be.true;

      // Verify correct path
      const readFileCall = fsStub.readFile.getCall(0);
      expect(readFileCall.args[0]).to.include(`${type}_${certificateId}.pem`);

      // Verify returned content
      expect(result).to.equal('test-certificate-content');
    });

    it('should throw ZatcaError if loading fails', async () => {
      fsStub.readFile.rejects(new Error('Read failed'));

      try {
        await certificate.loadCertificate('123', 'compliance');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.name).to.equal('ZatcaError');
        expect(error.code).to.equal('CERT_LOADING_ERROR');
      }
    });
  });
});