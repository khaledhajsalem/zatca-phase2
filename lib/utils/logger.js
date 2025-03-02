/**
 * Logger Utility
 * @module zatca-phase2/utils/logger
 * @private
 */

const winston = require('winston');
const config = require('config');
const fs = require('fs');
const path = require('path');

// Ensure log directory exists
const logDir = path.dirname(config.get('logging.file'));
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Create Winston logger instance
 * @type {Object}
 * @private
 */
const logger = winston.createLogger({
  level: config.get('logging.level'),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'zatca-phase2' },
  transports: [
    // Write logs to file
    new winston.transports.File({
      filename: config.get('logging.file')
    }),

    // Write to console in development
    process.env.NODE_ENV !== 'production'
      ? new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
      : null
  ].filter(Boolean)
});

module.exports = logger;