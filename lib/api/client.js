/**
 * HTTP Client for ZATCA API
 * @module zatca-phase2/api/client
 * @private
 */

const axios = require('axios');
const config = require('config');
const logger = require('../utils/logger');
const { ZatcaError, ErrorCodes } = require('../errors');

/**
 * Create an axios instance for ZATCA API
 * @type {Object}
 * @private
 */
const apiClient = axios.create({
  baseURL: config.get('api.baseUrl'),
  timeout: config.get('api.timeout') || 30000,
  validateStatus: status => status >= 200 && status < 500
});

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    logger.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  error => {
    logger.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  response => {
    logger.debug(`API Response: ${response.status}`, {
      data: response.data
    });

    // Check for ZATCA API errors
    if (response.data.errors && response.data.errors.length > 0) {
      logger.error('ZATCA API Error:', response.data.errors);

      const error = new ZatcaError(
        `ZATCA API Error: ${response.data.errors[0].message || 'Unknown error'}`,
        ErrorCodes.API_ERROR,
        response.data.errors
      );

      return Promise.reject(error);
    }

    return response;
  },
  error => {
    logger.error('API Response Error:', error);

    // Transform error to be more informative
    if (error.response) {
      // Server responded with an error
      const zatcaError = new ZatcaError(
        `ZATCA API Error: ${error.response.status} - ${error.response.statusText}`,
        ErrorCodes.API_ERROR,
        error.response.data
      );
      zatcaError.status = error.response.status;
      return Promise.reject(zatcaError);
    } else if (error.request) {
      // No response received
      return Promise.reject(new ZatcaError(
        `ZATCA API No Response: ${error.message}`,
        ErrorCodes.API_CONNECTION_ERROR
      ));
    } else {
      // Request setup error
      return Promise.reject(new ZatcaError(
        `ZATCA API Request Error: ${error.message}`,
        ErrorCodes.API_REQUEST_ERROR
      ));
    }
  }
);

// Override the post method to ensure proper error handling
const originalPost = apiClient.post;
apiClient.post = async function(...args) {
  try {
    return await originalPost.apply(this, args);
  } catch (error) {
    // Ensure all errors are ZatcaErrors
    if (error.name !== 'ZatcaError') {
      throw new ZatcaError(
        `ZATCA API Error: ${error.message}`,
        ErrorCodes.API_ERROR,
        error
      );
    }
    throw error;
  }
};

// Override the get method to ensure proper error handling
const originalGet = apiClient.get;
apiClient.get = async function(...args) {
  try {
    return await originalGet.apply(this, args);
  } catch (error) {
    // Ensure all errors are ZatcaErrors
    if (error.name !== 'ZatcaError') {
      throw new ZatcaError(
        `ZATCA API Error: ${error.message}`,
        ErrorCodes.API_ERROR,
        error
      );
    }
    throw error;
  }
};

module.exports = apiClient;