// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-error-handler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var buildResponseData = require('./data-builder');
var debug = require('debug')('strong-error-handler');
var format = require('util').format;
var logToConsole = require('./logger');
var sendJson = require('./send-json');

function noop() {
}

/**
 * Create a middleware error handler function.
 *
 * @param {Object} options
 * @returns {Function}
 */
exports = module.exports = function createStrongErrorHandler(options) {
  options = options || {};

  debug('Initializing with options %j', options);

  // Debugging mode is disabled by default. When turned on (in dev),
  // all error properties (including) stack traces are sent in the response
  var isDebugMode = options.debug;

  // Log all errors via console.error (enabled by default)
  var logError = options.log !== false ? logToConsole : noop;

  return function strongErrorHandler(err, req, res, next) {
    debug('Handling %s', err.stack || err);

    logError(req, err);

    if (res._header) {
      debug('Response was already sent, closing the underlying connection');
      return req.socket.destroy();
    }

    // this will alter the err object, to handle when res.statusCode is an error
    if (!err.status && !err.statusCode && res.statusCode >= 400)
      err.statusCode = res.statusCode;

    var data = buildResponseData(err, isDebugMode);
    debug('Response status %s data %j', data.statusCode, data);

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.statusCode = data.statusCode;

    // TODO: negotiate the content-type, take into account options.defaultType
    // For now, we always return JSON. See
    //  - https://github.com/strongloop/strong-error-handler/issues/4
    //  - https://github.com/strongloop/strong-error-handler/issues/5
    //  - https://github.com/strongloop/strong-error-handler/issues/6
    sendJson(res, data);
  };
};
