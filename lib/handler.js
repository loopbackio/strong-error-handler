// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-error-handler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var path = require('path');
var SG = require('strong-globalize');
SG.SetRootDir(path.resolve(__dirname, '..'));
var buildResponseData = require('./data-builder');
var debug = require('debug')('strong-error-handler');
var logToConsole = require('./logger');
var negotiateContentProducer = require('./content-negotiation');

function noop() {
}

/**
 * Create a middleware error handler function.
 *
 * @param {Object} options
 * @returns {Function}
 */
function createStrongErrorHandler(options) {
  options = options || {};

  debug('Initializing with options %j', options);

  // Log all errors via console.error (enabled by default)
  var logError = options.log !== false ? logToConsole : noop;

  return function strongErrorHandler(err, req, res, next) {
    logError(req, err);
    writeErrorToResponse(err, req, res, options);
  };
};

/**
 * Writes thrown error to response
 *
 * @param {Error} err
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Object} options
 */
function writeErrorToResponse(err, req, res, options) {
  debug('Handling %s', err.stack || err);

  options = options || {};

  // See https://nodejs.org/api/http.html#http_response_headerssent
  if (res.headersSent) {
    debug('Response was already sent. Skipping error response.');
    // We should not destroy the request socket as it causes Error: write EPIPE
    // return req.socket.destroy();
    return false;
  }

  // this will alter the err object, to handle when res.statusCode is an error
  if (!err.status && !err.statusCode && res.statusCode >= 400)
    err.statusCode = res.statusCode;

  var data = buildResponseData(err, options);
  debug('Response status %s data %j', data.statusCode, data);

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.statusCode = data.statusCode;

  var sendResponse = negotiateContentProducer(req, warn, options);
  sendResponse(res, data);
  return true;

  function warn(msg) {
    res.header('X-Warning', msg);
    debug(msg);
  }
};

exports = module.exports = createStrongErrorHandler;
exports.writeErrorToResponse = writeErrorToResponse;
